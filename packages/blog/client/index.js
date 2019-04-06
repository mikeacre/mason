import './blog'
import './page'
import './bootblog'


//set routes for blog console

var blogConsole = FlowRouter.group({
    prefix: '/blogconsole',
    name: 'blogconsole',
  });
  
blogConsole.route('/',{
    name: 'blog console',
    action: function(){
        BlazeLayout.render('MainLayout', {main: 'blogConsole'})
    }
});

FlowRouter.route('/',{
  name:'allBlogs',
  action: function(){
    GAnalytics.pageview("/blog");
    BlazeLayout.render('MainLayout', {main: 'blogConsole'})
  }
})

FlowRouter.route('/blog',{
  name:'allBlogs',
  action: function(){
    GAnalytics.pageview("/blog");
    BlazeLayout.render('MainLayout', {main: 'Blogs'})
  }
})

FlowRouter.route('/blog/:id',{
  name:'oneBlog',
  action: function(){
    BlazeLayout.reset()
    GAnalytics.pageview("/blog"+FlowRouter.getParam('id'));
    BlazeLayout.render('MainLayout', {main: 'Blog'})
  }
})

FlowRouter.route('/newblog',{
  name:'newBlog',
  action: function(){
    //if(Meteor.userId() && Meteor.user().profile.isAdmin)
      BlazeLayout.render('MainLayout', {main: 'newBlog'})
  }
})

FlowRouter.route('/newblog/:id',{
  name:'editBlog',
  action: function(){
    if(Meteor.userId())
      BlazeLayout.render('MainLayout', {main: 'newBlog'})
  }
})

FlowRouter.route('/blogdraft/:id',{
  name:'editBlog',
  action: function(){
    if(Meteor.userId() && Meteor.user().profile.isAdmin)
      BlazeLayout.render('MainLayout', {main: 'blogDraft'})
  }
})