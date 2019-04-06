import './bootblog.html'

Template.bootBlog.onCreated(function(){
    this.rows = new ReactiveVar([])
    this.AddRow = function(elem, data){
        let rowID = parseInt(Math.random()*50000);
        let thisRow = Blaze.renderWithData(Template.bootBlogRow, {id:rowID, row:data}, elem, this.view)
        //$('#deleteID').attr('id', rowID)
        $('#blogRowID').attr('id', rowID)        
        //$(`#${rowID}`).addClass(size)
        let rows = this.rows.get()
        rows.push({'id': rowID, 'template': thisRow})
        this.rows.set(rows)
    }
    this.GetRows = ()=>{

    }
})

Template.bootBlog.onRendered(function(){
    if(this.data.rows){
        this.data.rows.forEach((row)=>{
            this.AddRow(document.getElementById('POST'),row)
        })        
    }
    else
        this.AddRow(document.getElementById('POST'))
})


Template.bootBlog.events({
    'click #AddRow' : (e,t)=>{
        e.preventDefault()
        t.AddRow(document.getElementById('POST'))      

    },
    'click .delete-row' : (e,t)=>{
        let col = t.cols.get().find(x => x.id === parseInt(e.target.id))
        Blaze.remove(col.template)
        let cols = t.cols.get()
        cols.splice(cols.findIndex(x => x.id === parseInt(e.target.id)), 1)
        t.cols.set(cols)
    }
})

Template.bootBlogCol.onCreated(function(){
    this.type = new ReactiveVar('text')
    this.css = new ReactiveVar([])
    this.show = new ReactiveVar(false)
    this.ID = this.data.id
    this.Images = new ReactiveVar(false)
    this.changeType = function(type){
        if(!(type === this.type.get()))
        {
            $(`#${this.data.id}`).find('#content').empty()
            this.Images.set(
                Blaze.render(Template.bootBlogImageNode, document.getElementById(`${this.data.id}`), this.view))
        }
    }
})

Template.bootBlogCol.onRendered(function(){
    this.post = parseInt(Math.random()*50000)
    if(this.data.col){
        console.log(this.data.col)
        this.css.set(this.data.col.css)
        if(this.data.col.type === 'image'){            
            $(`#${this.data.id}`).find('#content').empty()
            this.Images.set(
                Blaze.renderWithData(Template.bootBlogImageNode,{images: this.data.col.data.images}, document.getElementById(`${this.data.id}`), this.view))
            
        }else{
            
            $($(`#${this.ID}`).find('#blogpost')).val(this.data.col.data.html)
            $($(`#${this.ID}`).find('#blogpost')).summernote({
                height: 400,
                dialogsInBody: true,
                callbacks: {
                  onInit: function () {
                    $('body > .note-popover').hide();
                  }
                },
                fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Dosis', 'Raleway'],
                fontNamesIgnoreCheck: ['Dosis', 'Raleway'],
              });
        }
    }
    else{
        $($(`#${this.ID}`).find('#blogpost')).summernote({
            height: 400,
            dialogsInBody: true,
            callbacks: {
              onInit: function () {
                $('body > .note-popover').hide();
              }
            },
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Dosis', 'Raleway'],
            fontNamesIgnoreCheck: ['Dosis', 'Raleway'],
          });
    }    
})

Template.bootBlogCol.helpers({
    'css': ()=>{
        return Template.instance().css.get()
    },
    'show': ()=>{
        return Template.instance().show.get()
    },
    'ID': ()=>{
        return Template.instance().ID
    },
    'isPreview': ()=>{
        
        return Template.instance().view.parentView.parentView._templateInstance.isPreview.get()
    }
})

Template.bootBlogCol.events({
    'change #displayType':(e,t)=>{
        t.changeType(e.target.value)
    },    
    'submit #addCategory': (e, t) => {
        e.preventDefault();
        console.log(e)
        let name = e.target.categoryName.value;        
        let css = t.css.get()
        css.push({name:name})
        t.css.set(css)
        t.show.set(false)
  
      },
      'submit #editCategory': (e, t) => {
        e.preventDefault()
        let oldName = e.target.name.name
        let newName = e.target.name.value
        let css = t.css.get()
        css[css.findIndex(x => x.name === oldName)].name = newName
        t.css.set(css)
        t.show.set(false)
  
      },
      'click #delCategory': (e, t) => {
        e.preventDefault()
        console.log
        let css = t.css.get()
        css.splice(css.findIndex(x => x.name === e.currentTarget.name),1)
        t.css.set(css)
        t.show.set(false)
      },
      'click #close': (e, t) => {
        t.show.set(false)
      },
      'click #add': (e, t) => {
        t.show.set(true)        
      },
      'click .category': (e, t) => {
        t.show.set(e.target.id)
      }
})


Template.bootBlogRow.onCreated(function(){
    /*
        Each row can contain up to 3 cols.
        When creating a new row you must check current size and re adjust other sizes.
    */
    this.cols = new ReactiveVar([])  
    this.ID = this.data.id
    this.isPreview = new ReactiveVar(false)
    this.togglePreview = () =>{
        if(this.isPreview.get())
        {
            let cols =  this.cols.get()

            cols.forEach((col)=>{
                if($(`#${col.id}`).find('#displayType').val() === 'text'){
                    let data = $(`#${col.id}`).find('#content').html()
                    let textarea = $(`<textarea id="blogpost">${data}</textarea>`)
                    $(`#${col.id}`).find('#content').html(textarea)
                    textarea.summernote({
                        height: 400,
                        dialogsInBody: true,
                        callbacks: {
                        onInit: function () {
                            $('body > .note-popover').hide();
                        }
                        },
                        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Dosis', 'Raleway'],
                        fontNamesIgnoreCheck: ['Dosis', 'Raleway'],
                    });
                }
            })
        }
        else
        {
            let cols =  this.cols.get()
            cols.forEach((col)=>{
                if($(`#${col.id}`).find('#displayType').val() === 'text'){
                    let data = $(`#${col.id}`).find('#blogpost').val()
                    $(`#${col.id}`).find('#blogpost').summernote('destroy')
                    $(`#${col.id}`).find('#content').html(data)
                }
            })
        }
        this.isPreview.set(!this.isPreview.get())
    }

    this.bootSize = function(size){
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

    this.changeSize= (col, size) =>{
        let cols = this.cols.get()
        cols[col].size = size
        this.cols.set(cols)
        console.log($(`#${cols[col].id}`))
        $(`#${cols[col].id}`)
            .removeClass('col-sm-12 col-sm-6 col-sm-8 col-sm-4')
            .addClass(this.bootSize(size))

    }

    this.getSize = function (col){
        return this.cols.get()[col].size
    }

    this.AddCol = function(row) {
        let numCols = this.cols.get().length 
        console.log(numCols)       
        let size = '1-1'
        //check num cols
        switch(numCols){
            case 1:
                //check size
                switch(this.getSize(0)){
                    case '1-1':
                        this.changeSize(0, '1-2')
                        size = '1-2'
                        break
                    case '2-3':
                        size = '1-3'
                        break
                    case '1-3':
                        size = '2-3'
                        break
                }
                break
            case 2:
                switch(this.getSize(0)){
                    case '1-2':
                        this.changeSize(0, '1-3')
                        this.changeSize(1, '1-3')                        
                        break
                    case '1-3':
                        if(this.getSize(1) != '1-3')
                            this.changeSize(1, '1-3')
                        break
                    case '2-3':
                        this.changeSize(0, '1-3')
                        break                    
                }
                size = '1-3'
                break
            case 3:
                size = false;
                return                
        }
        if(size){
            let colID = parseInt(Math.random()*50000);
            let thisCol = Blaze.renderWithData(
                Template.bootBlogCol, 
                {id: colID , size: size, bootSize: this.bootSize(size)}, 
                row, 
                this.view)
              
            let cols = this.cols.get()
            cols.push({'id': colID, 'size': size, 'template': thisCol})
            this.cols.set(cols)
            this.changeSize(numCols, size)   
        }
    }
    this.renderCol = (data) =>{
        let numCols = this.cols.get().length 
        let colID = parseInt(Math.random()*50000);

        let thisCol = Blaze.renderWithData(
            Template.bootBlogCol, 
            {id: colID , size: data.size, bootSize: this.bootSize(data.size), col: data}, 
            document.getElementById(this.data.id), 
            this.view)
        let cols = this.cols.get()
        cols.push({'id': colID, 'size': data.size, 'template': thisCol})
        this.cols.set(cols)
        this.changeSize(numCols, data.size)   
    
    }
    
    

    
})

Template.bootBlogRow.onRendered(function(){
    if(this.data.row){
        this.data.row.forEach((col)=>{
            this.renderCol(col)
        })
    }
    else
        this.AddCol(document.getElementById(this.data.id))
})

Template.bootBlogRow.helpers({
    'isPreview': ()=>{
        return Template.instance().isPreview.get()
    }
})


Template.bootBlogRow.events({
    'change #displaySize':(e,t)=>{
        t.changeSize(t.cols.get().findIndex(x => x.id === parseInt(e.target.name)), e.target.value)
        console.log(e.target.name, t.cols.get().findIndex(x => x.id === parseInt(e.target.name)))
        console.log(t.cols.get()[t.cols.get().findIndex(x => x.id === parseInt(e.target.name))].template)
    },
    'click .AddCol' : (e,t)=>{
        e.preventDefault()
        t.AddCol(document.getElementById(e.target.name))      

    },
    'click .delete-col' : (e,t)=>{
        let col = t.cols.get().find(x => x.id === parseInt(e.target.id))
        console.log(col)
        Blaze.remove(col.template)
        let cols = t.cols.get()
        cols.splice(cols.findIndex(x => x.id === parseInt(e.target.id)), 1)
        t.cols.set(cols)
    },
    'click .DelRow' : (e,t)=>{
        Blaze.remove(t.view)
    },
    'click .previewRow': (e,t)=>{
        e.preventDefault()
        t.togglePreview()
    }
})

Template.bootBlogImageNode.onCreated(function(){
    this.images = new ReactiveVar(this.data.images)
    this.working = new ReactiveVar(0)
    this.data.id = parseInt(Math.random()*50000)
    console.log(this.images.get())
})

Template.bootBlogImageNode.helpers({
    images: () => {
        return Template.instance().images.get();
      }
})

Template.bootBlogImageNode.events({
    'change .custom-file-input': (e,t) => { 
        console.log(t)       
        //display image to upload.. but dont do upload till complete.
        console.log(e, e.target.id)
        let files = document.getElementById(t.data.id).files
        console.log(files)
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
                  console.log('pushing',images)
                  
                  t.images.set(images)          
                  t.working.set(t.working.get()-1)
              }
          }; 
        }
        console.log(t.images.get())
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


  

