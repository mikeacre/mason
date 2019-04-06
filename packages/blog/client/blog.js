
import './blog.html';

Template.Blog.onCreated(function () {


  Meteor.subscribe('blogusers')
  Tracker.autorun(() => {
    this.id = FlowRouter.getParam('id');
  })

  this.blog = new ReactiveVar(false);

  Meteor.call('getBlog', this.id, (err, res) => {
    if (!res) {
      //if there is no blog for this put a 404 page on header so it will not cashe the pre render
      $('head').append('<meta  name="prerender-status-code" content="404">');
      return false
    }

    this.blog.set(res)

  })


})

Template.Blog.onRendered(function () {


})

Template.Blog.helpers({
  bloginfo: () => {
    return Template.instance().blog.get();
  },
  bootSize :  function(size){
    switch(size){
        case '1-1':
            return 'col-sm-12'
        case '1-2':
            return 'col-sm-6'
        case '1-3':
            return 'col-sm-4'
        case '2-3':
            return 'col-sm-8'
        default:
            return false;
    }

  }

});

Template.Blog.events({
  'click #publish':(e,t)=>{
    console.log(t.id)
    Meteor.call('setDraft', t.id, false)
    location.reload();
  },
  'click a': (e) => {
    GAnalytics.event("click", e.target.href);
  }
})



Template.Blogs.onCreated(function () {
  this.subscribe('blogPreviews'); //just load needed data exclude blog posts
  this.showDrafts = new ReactiveVar(false);
  this.category = new ReactiveVar('Blog');
  this.categories = new ReactiveVar(false)
  this.ready = new ReactiveVar(false)
  Meteor.call('getData', 'categories', (err,res)=>{
    this.categories.set(res[0].data.categories)
  })  
})

Template.Blogs.helpers({
  blog: () => {
    if (!Template.instance().category.get())
      return Blog.find({
        isDraft: false,
        category: 'Blog'
      }, {
        sort: {
          createdAt: -1
        }
      })
    else
      return Blog.find({
        isDraft: false,
        category: Template.instance().category.get()
      }, {
        sort: {
          createdAt: -1
        }
      })
  },
  ListCategories: () => {
    return Template.instance().categories.get() ? Template.instance().categories.get() : null;
  },
  ready:()=>{
    return Template.instance().subscriptionsReady()
  }
});

Template.Blogs.events({

  'change #category': (e, t) => {
    console.log($('#category').val())
    t.category.set($('#category').val())
  }
})

Template.newBlog.onCreated(function () {
  this.title = new ReactiveVar(false)
  this.img = new ReactiveVar(false)
  this.keywords = new ReactiveVar(false)
  this.excerpt = new ReactiveVar(false)
  this.working = new ReactiveVar(false)
  this.images = new ReactiveVar(false)
  this.bootBlog = new ReactiveVar(false)
  this.blog = new ReactiveVar(false)
  this.id = new ReactiveVar(false)
  this.subscribe('data', ['categories'])
  Tracker.autorun(()=>{
      if(FlowRouter.getParam('id') && (FlowRouter.getParam('id') != this.id.get())){
          Meteor.call('getBlog', FlowRouter.getParam('id'), (err,res)=>{
              this.blog.set(res)
              this.images.set(res.images)
              this.title.set(res.title)
              this.keywords.set(res.keywords)
              this.excerpt.set(res.excerpt)
              $('#title').val(res.title)
              $('#videoID').val(res.videoID)
              $('#keywords').val(res.keywords)
              $('#excerpt').val(res.excerpt)
              $('#category').val(res.category)
              //Clear boot blog
              //Add By Row or send rown?
              //Blaze.remove(this.bootBlog.get())
              if(!this.bootBlog.get())
                  this.bootBlog.set(
                  Blaze.renderWithData(
                      Template.bootBlog,
                      {rows: res.body},
                      document.getElementById('bootBlog'),
                      this.view))
          })//End blog
      }
    })
});

Template.newBlog.onRendered(function () {
  if(!FlowRouter.getParam('id'))
    this.bootBlog.set(Blaze.render(Template.bootBlog, document.getElementById('bootBlog'), this.view))

 
})



Template.newBlog.helpers({
  isDone: () => {
    //checks fields and determins if ready to submit.
    return Template.instance().title.get() && Template.instance().keywords.get() && Template.instance().excerpt.get();
  },
  images: () => {
    return Template.instance().images.get();
  },
  working: () => {
    return Template.instance().working.get();
  },
  ListCategories: () => {
    return Template.instance().subscriptionsReady() ? Data.findOne({
      name: "categories"
    }).data.categories: null
  },
  edit: ()=>{
    return Template.instance().blog.get()
}
});

Template.newBlog.events({
  'keyup #keywords': (e, t) => {
    t.keywords.set(e.target.value)
  },
  'keyup #title': (e, t) => {
    t.title.set(e.target.value)
  },
  'keyup #excerpt': (e, t) => {
    t.excerpt.set(e.target.value)
  },
  'click #removePost': (e,t) =>{
    e.preventDefault()
    if (prompt('Are you sure? Type: Y') === 'Y')        
      Meteor.call('deleteBlog', t.blog.get()._id, (err) => {
        if (!err)
          FlowRouter.go('/blogConsole');
        else
          console.log(err)
      })
},
'submit #submitBlog': (e, t) => {
  e.preventDefault()
  t.working.set(true)
  try{
      $("html, body").animate({
          scrollTop: 0
      }, "slow");
      let bootBlog = Blaze.getView(document.getElementById(`POST`)) 

      let allRows = []
      let rows = bootBlog._templateInstance.rows.get()
      t.working.set(true) 
      rows.forEach((row)=>{
          let rowData = []
          let thisRow = Blaze.getView(document.getElementById(`${row.id}`))
          thisRow._templateInstance.isPreview.get() ?  thisRow._templateInstance.togglePreview(): null; 
          let cols = thisRow._templateInstance.cols.get()      
          cols.forEach((col)=>{
              let thisCol = Blaze.getView(document.getElementById(`${col.id}`))
              let images = []
              if($(`#${col.id}`).find('#displayType').val() != 'text'){
              console.log(thisCol, thisCol._templateInstance.Images.get())          
              images = thisCol._templateInstance.Images.get().dataVar ? 
                  thisCol._templateInstance.Images.get().dataVar.curValue.images:
                  thisCol._templateInstance.Images.get()._templateInstance.images.get()

              }
              
              rowData.push({
              size: col.size,
              css: thisCol._templateInstance.css.get(),
              type: $(`#${col.id}`).find('#displayType').val(),
              data: $(`#${col.id}`).find('#displayType').val() === 'text' ?
                  $(`#${col.id}`).find('#blogpost').val() : images

              })   
          })
          allRows.push(rowData)
      })               

      var blog = {
          title: $('#title').val(),
          keywords: $('#keywords').val(),
          category: $('#category').val(),
          excerpt: $('#excerpt').val(),
          slug: $('#slug').val(),
          content: "old content",
          videoID: $('#videoID').val(),
          imgUrl: false,
          post: allRows,
          images: t.images.get()

      }
      if(t.blog.get()){
          Meteor.call('editPost', t.blog.get()._id, blog, (err,res)=>{
            if(err){

              t.working.set(false) 
              alert('There was an error, check console.')
            }
            else{
              t.blog.set(false)
              FlowRouter.go('/blog/'+res)
              //t.destroy()   
            }
          })
        }
        else{
          Meteor.call('publishPost', blog, (err,res)=>{
            console.log(blog)
            if(err){
              console.log(err)
              t.working.set(false) 
              alert('There was an error, check console.')
            }
            else{
              console.log(res)
              FlowRouter.go('/blog/'+res)
              //t.destroy()   
            }
          })
        }
  }
  catch(e){
      console.log(e)
      t.working.set(false)
  }

},
'change #img-upload': (e,t) => {
  e.preventDefault()
  //display image to upload.. but dont do upload till complete.
  let files = document.getElementById(e.target.id).files
  let images = t.images.get() ? t.images.get() : [];
  t.working.set(files.length)            
  for(let i=0; i != files.length; i++){
    let reader = new FileReader();              
    reader.readAsDataURL(files[i]);
    reader.onload = () => {
        const image = new Image();
        image.src = reader.result 
        image.onload = () => {
            
            images.push({
                img: resizeImage(image, files[i].type, 2160), 
                name: files[i].name,
                small: resizeImage(image, files[i].type, 600),
                thumb: resizeImage(image, files[i].type, 200),
                type: files[i].type
            })
            
            t.images.set(images)          
            t.working.set(t.working.get()-1)
        }
    }; 
  }
},
'click .img-upload': (e,t) =>{
  console.log(t.images.get())
  let images = t.images.get()
  index = images.findIndex(x => x.name === e.target.id)
  images.splice(index, 1)
  t.images.set(images)
  //document.getElementById(e.target.id).remove()
  console.log(t.images.get())
  
},
})



Template.blogConsole.onCreated(function () {
  this.showDrafts = new ReactiveVar(5);
  this.showOptions = new ReactiveVar(false);
  this.viewDraft = new ReactiveVar(true);
  this.emailID = new ReactiveVar(false);
  Meteor.subscribe('blogConsole')
  Meteor.subscribe('mailinglistdata');
  Meteor.subscribe('data', ['categories']);

})

Template.blogConsole.helpers({
  'messages': () => {
    return Session.get('message')
  },
  'errors': () => {
    return Session.get('errors')
  },
  'drafts': () => {
    return Blog.find({
      isDraft: Template.instance().viewDraft.get()
    }, {
      limit: Template.instance().showDrafts.get(),
      sort: {
        createdAt: -1
      }
    })
  },
  'post': () => {
    posts = []
    Blog.find({}, {
      limit: 0,
      sort: {
        createdAt: -1
      }
    }).forEach((doc) => {
      doc.wasSent = MailingListData.findOne({
        contentID: doc._id
      }) ? true : false;
      posts.push(doc)
    })
    return posts;
  },
  'pageOption': () => {
    return Pages.find({});
  },
  'categories': () => {
    return Data.findOne({
      name: 'categories'
    }) ? Data.findOne({
      name: 'categories'
    }).data.categories : null;
  },
  'draftsCount': () => {
    return Blog.find({
      isDraft: Template.instance().viewDraft.get()
    }).count()
  },
  'showOptions': (option) => {
    return Template.instance().showOptions.get() === option;
  },
  'emailData': () => {
    const email = Blog.findOne({
      _id: Template.instance().emailID.get()
    })
    const mlData = MailingListData.findOne({
      contentID: email._id
    });
    email.wasSent = mlData ? true : false;
    if (email.wasSent) {
      email.email = mlData.emails
      email.totalSent = email.email.length
      email.opened = 0
      email.email.forEach((doc) => {
        email.opened += Tracked.findOne(doc.trackerID).isTracked ? 1 : 0;
      })
    }
    return email;
  }
})

Template.blogConsole.events({
  'click .showAllDrafts': (e, t) => {
    t.showDrafts.set(t.showDrafts.get() === 0 ? 5 : 0);
  },
  'click .send-email': (e, t) => {
    t.showOptions.set('choosePost');
    
  },
  'click .close': (e, t) => {
    t.showOptions.set('false');
  },
  'click .view-post': (e, t) => {
    t.emailID.set(e.currentTarget.id);
    $('.console-info').toggleClass('d-none')
    $('.console-mask').toggleClass('d-none')
    Meteor.call('makeEmail', e.currentTarget.id, (err,res)=>{
      
      $('#SampleEmail').html(res)
    })
  },
  'submit #addMailingList': (e, t) => {
    e.preventDefault();
    Meteor.call('subscribe', e.target.newEmail.value, (err, res) => {
      console.log(err)
      if (!err)
        Session.set('message', `<strong>${e.target.newEmail.value}</strong> Added to Mailing List!`)
      else {
        Session.set('errors', `<strong>${e.target.newEmail.value}</strong> already exists or invalid`)
      }
    })
    e.target.newEmail.value = null;
  },
  'click .switch-input': (e, t) => {
    if (e.target.value === 'published')
      t.viewDraft.set(false)
    else
      t.viewDraft.set(true)

  },
  'click #editPage': (e, t) => {
    FlowRouter.go('/editPage/' + $('#selectPage').val())
  }
})

Template.datePicker.onRendered(function () {
  $('#sendDate').datepicker()

})

Template.EmailInfo.onCreated(function () {
  this.times = {
    hours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    mins: ['00', 15, 30, 45],
    ampm: ['am', 'pm']
  }
  this.send = new ReactiveVar('now');

  
  Meteor.subscribe('tracked');
  Meteor.subscribe('mailinglist');
})



Template.EmailInfo.helpers({
  'sendLater': () => {
    return true;
  },
  time: () => {
    return Template.instance().times;
  },
  sendLater: () => {
    return Template.instance().send.get() === 'later'
  },
  sendTest: () => {
    return Template.instance().send.get() === 'test';
  },
  getEmail: (id) => {
    return MailingList.findOne(id).eMail
  },
  getOpened: (id) => {
    return Tracked.findOne(id).isTracked
  }


})

Template.EmailInfo.events({
  'change #send': (e, t) => {
    t.send.set(e.target.value)
    if (e.target.value === 'later')
      $('#sendDate').datepicker()
  },
  'submit #sendEmail': (e, t) => {
    e.preventDefault()
    console.log(e)
    let form = e.target
    let contentID = form.contentID.value
    let date = new Date()

    if (form.send.value === 'later') {
      let hour = form.sendAmPm.value === 'pm' ? parseInt(form.sendHour.value) + 12 : parseInt(form.sendHour.value);
      let min = parseInt(form.sendMin.value);
      date = $('#sendDate').datepicker('getDate');
      date = new Date(date.setHours(hour, min, 0))
    }
    title = form.title.value
    console.log(contentID)
    if (form.send.value === 'test')
      Meteor.call('sendTestMailingList', contentID, title, form.testEmail.value)
    else
      Meteor.call('scheduleEmail', date, title, contentID)
    Session.set('message', `<strong>${title}</strong> will send on ${date.toString()}`)
    $('.console-info').toggleClass('d-none')
    $('.console-mask').toggleClass('d-none')

  }

})

Template.editCategories.onCreated(function () {
  this.show = new ReactiveVar(false);
  this.showCategory = new ReactiveVar(false);
})

Template.editCategories.helpers({
  showAdd: () => {
    return Template.instance().show.get() === 'add'
  },
  showEdit: () => {
    return Template.instance().show.get() === 'edit'
  },
  showCategory: () => {

    const categories = Data.findOne({
      name: 'categories'
    }) ? Data.findOne({
      name: 'categories'
    }).data.categories[parseInt(Template.instance().showCategory.get())] : null;
    return categories
  }

})

Template.editCategories.events({
  'click .close': (e, t) => {
    t.show.set(false)
    t.showCategory.set(false)
    $('.main').toggleClass('d-none')
    $('.pop').toggleClass('d-none')
  },
  'click #add': (e, t) => {
    t.show.set('add')
    $('.main').toggleClass('d-none')
    $('.pop').toggleClass('d-none')
  },
  'click .category': (e, t) => {

    t.showCategory.set(e.target.id)
    $('.main').toggleClass('d-none')
    $('.pop').toggleClass('d-none')
    t.show.set('edit')
  },
  'submit #addCategory': (e, t) => {
    e.preventDefault();
    console.log(e)
    let name = e.target.categoryName.value;
    Meteor.call('addBlogCategory', name, null, (e, r) => {
      t.show.set('false')
      $('.main').toggleClass('d-none')
      $('.pop').toggleClass('d-none')
    })
  },
  'submit #editCategory': (e, t) => {
    e.preventDefault()
    Meteor.call('editBlogCategory', t.showCategory.get(), e.target.categoryName.value, null, (e, r) => {
      t.show.set('false')
      t.showCategory.set(false)
      $('.main').toggleClass('d-none')
      $('.pop').toggleClass('d-none')
    })
  },
  'click #delCategory': (e, t) => {
    Meteor.call('delBlogCategory', t.showCategory.get(), (e, r) => {
      t.show.set('false')
      t.showCategory.set(false)
      $('.main').toggleClass('d-none')
      $('.pop').toggleClass('d-none')
    })
  },
})



Template.showComments.onCreated(function () {
  this.comments = new ReactiveVar(false)
  this.id = FlowRouter.getParam('id')
  Meteor.call('getComments', this.id, (err, res) => {
    this.comments.set(res)
  })
})

Template.showComments.events({
  'submit #doAddComment': (e, t) => {
    e.preventDefault()
    comment = e.target.comment.value;
    $('.comment-field').html('<h2>Pending...</h2>')
    Meteor.call('addComment', comment, FlowRouter.getParam('id'), (err, res) => {
      if (!err)
        $('.comment-field').html('<span>Comment Submitted!</span>')
      else
        $('.comment-field').html(err.Message)
      Meteor.call('getComments', t.id, (err, res) => {
        t.comments.set(res)
      })

    })
  },
  'click .delete-comment': (e, t) => {
    Meteor.call('delComment', e.target.id, () => {
      Meteor.call('getComments', t.id, (err, res) => {
        t.comments.set(res)
      })
    })


  }
})

Template.showComments.helpers({
  'comments': () => {
    return Template.instance().comments.get();
  }
})