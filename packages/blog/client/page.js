import './page.html';

Template.Page.onCreated(function () {
    this.section = new ReactiveVar(false)
    this.section.set(FlowRouter.getParam('section') || Template.currentData().showsection);
    this.page = new ReactiveVar(false);
    Meteor.call('getPage', this.section.get(), (err, res) => {
        if (!res) {
            //if there is no blog for this put a 404 page on header so it will not cashe the pre render
            $('head').append('<meta  name="prerender-status-code" content="404">');
            return false
        }
        if (err)
            console.log(err)
        this.page.set(res)
    })
})


Template.Page.helpers({
    'page': () => {
        return Template.instance().page.get();
    }
})

Template.Page.events({
    'click a': (e) => {
        GAnalytics.event("click", e.target.href);
    }
})

Template.newPage.onCreated(function () {
    this.title = new ReactiveVar(false)
    this.img = new ReactiveVar(false)
    this.keywords = new ReactiveVar(false)
    this.excerpt = new ReactiveVar(false)
    this.working = new ReactiveVar(false)
    this.images = new ReactiveVar(false)
    this.bootBlog = new ReactiveVar(false)
    this.page = new ReactiveVar(false)
    this.id = new ReactiveVar(false)
    Tracker.autorun(()=>{
        if(FlowRouter.getParam('id') && (FlowRouter.getParam('id') != this.id.get())){
            Meteor.call('getPage', FlowRouter.getParam('id'), (err,res)=>{
                this.page.set(res)
                this.images.set(res.images)
                this.title.set(res.title)
                this.keywords.set(res.keywords)
                this.excerpt.set(res.excerpt)
                $('#title').val(res.title)
                $('#videoID').val(res.videoID)
                $('#keywords').val(res.keywords)
                $('#excerpt').val(res.excerpt)
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
            })//End getPage
        }
      })
});

Template.newPage.onRendered(function () {
    if(!FlowRouter.getParam('id'))
        this.bootBlog.set(Blaze.render(Template.bootBlog, document.getElementById('bootBlog'), this.view))
  


})

Template.newPage.onDestroyed(function () {

});


Template.newPage.helpers({
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
    edit: ()=>{
        return Template.instance().page.get()
    }
});

Template.newPage.events({
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
          Meteor.call('deletePage', t.page.get()._id, (err) => {
            if (!err)
              FlowRouter.go('/blogConsole');
            else
              console.log(err)
          })
    },
    'submit #submitPage': (e, t) => {
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
    
            var page = {
                title: $('#title').val(),
                keywords: $('#keywords').val(),
                excerpt: $('#excerpt').val(),
                slug: $('#slug').val(),
                content: "old content",
                videoID: $('#videoID').val(),
                imgUrl: false,
                post: allRows,
                images: t.images.get()
    
            }
            if(t.page.get()){
                console.log(page.images)
                Meteor.call('editPage', t.page.get()._id, page, (err,res)=>{
                  if(err){
                    console.log(err)
                    t.working.set(false) 
                    alert('There was an error, check console.')
                  }
                  else{
                    console.log(res)
                    t.page.set(false)
                    FlowRouter.go('/blogconsole')
                    //t.destroy()   
                  }
                })
              }
              else{
                console.log(page.images)
                Meteor.call('uploadPage', page, (err,res)=>{
                  if(err){
                    console.log(err)
                    t.working.set(false) 
                    alert('There was an error, check console.')
                  }
                  else{
                    console.log(res)
                    FlowRouter.go('/blogconsole')
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

