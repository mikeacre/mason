Meteor.methods({
    //Begin Blog + Mailing list functions
    sendEmail(to, from, subject, html) {
      // Make sure that all arguments are strings.
      check([to, from, subject, html], [String]);
      // Let other method calls from the same client start running, without
      // waiting for the email sending to complete.
      this.unblock();
      try{
        Email.send({ to, from, subject, html });
      }
      catch(err){
        return err
      }
      return true;
    },
    makeEmail(contentID){
        var blog = Blog.findOne({_id:contentID});
        let body = blog.body
        let emailBody = ""
        let getSize = (size)=>{
          switch(size){
            case '1-1':
              return '12'
            case '1-2':
              return '6'
            case '2-3':
              return '8'
            case '1-3':
              return '4'
          }
        }
        body.forEach((row)=>{
          emailBody += '<tr>'
          row.forEach((col)=>{
            if(col.type === 'text'){
            emailBody += `<td colspan="${getSize(col.size)}">${col.data.html}</td>`
            }
            else{
              emailBody += `<td colspan="${getSize(col.size)}" style="vertical-align:top;"><img src="${col.data.images[0].smallUrl}" width="100%"></td>`
            }
          })
          emailBody += '</tr>'
        })
        emailFooter= `<small><a href="https://magicbookuniversity.com/unsubscribe">Click here to unsubscribe</a></small>`
        let email = `<body><table cellspacing="0" width="100%"><tr><td><img src="${blog.images[0].smallUrl}" width="100%" style="max-width:100%;"></td></tr></table><table width="100%">${emailBody}<tr><td colspan="4">${emailFooter}</td></tr></table></body>`
        return email
  
      },
      sendToMailingList(contentID, title){
        var blog = Blog.findOne({_id:contentID});
        sentTo = []
        let message = Meteor.call('makeEmail', contentID)
        MailingList.find({}).forEach((doc)=>{
          let trackedID = Tracked.insert({trackedID:doc._id, isTracked: false});
          let usrMsg = message + `<img src="${Meteor.settings.URL}/imgpixel/${trackedID}" width="1px" height="1px">`;
          Meteor.call('sendEmail', doc.eMail , Meteor.settings.MAILLIST_EMAIL, title , usrMsg);
          sentTo.push({emailID: doc._id, trackerID: trackedID});
        })
  
        MailingListData.insert({contentID: contentID, emails: sentTo});
      },
      sendTestMailingList(contentID, title, email){
        var blog = Blog.findOne({_id:contentID});
        let message = Meteor.call('makeEmail', contentID)
        Meteor.call('sendEmail', email , Meteor.settings.MAILLIST_EMAIL, title , message);
      },
      addMailingList(email){
        MailingList.insert({eMail:email, subscribed:true})
      },
      preRender(url){
        console.log(url)
        HTTP.call('POST', "https://api.prerender.io/recache", {
        headers:{
          "Content-Type": "application/json",
        },
        data:{
          "prerenderToken": "eyXg8cZfulC6Nry8DGUk",
          "url": url
        }   
        
      })
      return true;
    },
    polishPost(post){      
      post.images.forEach((img)=>{
        if(!img.imgUrl){ 
          img.imgUrl = Meteor.call('dataToBucket', img.img, img.type, img.name),
          img.smallUrl = Meteor.call('dataToBucket', img.small, img.type, "small"+img.name, 0.5),
          img.thumbUrl = Meteor.call('dataToBucket', img.thumb, img.type, "thumb"+img.name, 0.4)
          delete img.small
          delete img.img
          delete img.thumb
        }
      })
      post.post.forEach((row)=>{
        row.forEach((col)=>{       
          if(col.type === 'image'){
            col.data.forEach((img)=>{
              if(!img.imgUrl){ 
                img.imgUrl = Meteor.call('dataToBucket', img.img, img.type, img.name),
                img.smallUrl = Meteor.call('dataToBucket', img.small, img.type, "small"+img.name, 0.5),
                img.thumbUrl = Meteor.call('dataToBucket', img.thumb, img.type, "thumb"+img.name, 0.4)
                delete img.small
                delete img.img
                delete img.thumb    
              }         
            })
            col.data = {images:col.data}
          }
          else if(col.type ==='text'){
            col.data = {html: col.data}
          }
        })
      })
      
      post.body = post.post
      return post
    },
    publishPost(post){
      post = Meteor.call('polishPost', post)
      post.isDraft = true
      let blogID = Blog.insert(post)
      let url = `${Meteor.settings.URL}/blog/${blogID}`
      
      console.log('NEW POST::', url)
  
      Jobs.run("doPrerender", url,{
        date: new Date(),
        priority: 9999999999
      });
  
      return blogID;
    },
    editPost(id, post){
      post = Meteor.call('polishPost', post)
      Blog.update({_id: id}, {$set:{
        images: post.images,
        title: post.title,
        keywords: post.keywords,
        excerpt: post.excerpt,
        videoID: post.videoID,    
        body: post.body
      }})
      let url = `${Meteor.settings.URL}/blog/${id}`
      Jobs.run("doPrerender", url,{
        date: new Date(),
        priority: 9999999999
      });
      console.log('Edited Post @::', url)
      return id;
    },
    deleteBlog(id){
      Blog.remove(id);
    },
    async getBlog(id){
      const blog = await Blog.findOne({_id:id});
      return blog;  
    },
    
    subscribe(email){
      if(MailingList.findOne({eMail:email}))
      throw new Meteor.Error('Email already exists')
      MailingList.insert({eMail:email, subscribed:true});
      return true;
    },
    setDraft(id, set){
      //take id of a blog and boolean for if it should be a draft or not and update blogpost
      console.log(id)
      return Blog.update(id, {$set:{isDraft:set}});
      
    },
    scheduleEmail(dateTime, title, contentID) {
      console.log(contentID)
      Jobs.run("scheduleEmail", contentID, title, {
        date: dateTime,
        priority: 9999999999
      });
    },
    deletePage(id){
      Pages.remove(id);
    },
    getPage(id){
      const page = Pages.findOne({$or:[{_id:id},{slug:id}]});
      return page;  
    },
    uploadPage(post){
      post = Meteor.call('polishPost', post)
      console.log(post)
      let blogID = Pages.insert(post)
      let url = `${Meteor.settings.URL}/blog/${blogID}`
      console.log('NEW PAGE::', url)
      return post;
      
    },
    editPage(id, post){
      post = Meteor.call('polishPost', post)
      Pages.update({_id: id}, {$set:{
        images: post.images,
        title: post.title,
        slug: post.slug,
        keywords: post.keywords,
        excerpt: post.excerpt,
        videoID: post.videoID, 
        body: post.body
      }})
      let url = `${Meteor.settings.URL}/blog/${id}`
      console.log('Edited Post @::', url)
      return post;
    },
    
    
    async uploadToBucket(params, data){
      var base64data = new Buffer(data, 'binary');
      params.Body = base64data;
      s3 = new AWS.S3();
      //const upload = await s3.upload(params);
      const test = await s3.upload(params).promise();
      console.log(test)
      return test;
      
    },
    
    addComment(comment, id){
      return Comments.insert({comment:comment, contentID:id})
    },
    delComment(id){
      return Comments.remove({_id:id})
    },
    async getComments(id){
      try{
        const comments = await Comments.find({contentID:id},{sort:{createdAt: -1}});
        return comments.fetch();
      }catch(e){
        throw new Meteor.Error("!ERRER~!!")
      }
      
      
    },
    
    
    addBlogCategory(name, description){
      let categories = Data.findOne({name:'categories'}).data.categories;
      categories.push({name:name, description:description});
      console.log(categories)
      Data.update({name:'categories'}, {$set:{'data.categories':categories}})
      
    },
    editBlogCategory(index, name, description){
      let categories = Data.findOne({name:'categories'}).data.categories;
      categories[index] = {name:name, description:description};
      Data.update({name:'categories'}, {$set:{'data.categories':categories}})
      
    },
    delBlogCategory(index){
      index = parseInt(index)
      let categories = Data.findOne({name:'categories'}).data.categories;
      categories.splice(index,1);
      Data.update({name:'categories'}, {$set:{'data.categories':categories}})
      
    },
    
    createBlogData(){

      Data.insert({name:'categories', data: {categories:[{name:'Blog', isDefault:true, description:'Blog Posts'}]}});
      
    },
    
    //END BLOG FUNCTIONS
})