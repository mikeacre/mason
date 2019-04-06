import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);




Blog = new Mongo.Collection('blog');
Pages = new Mongo.Collection('pages')
MailingList = new Mongo.Collection('mailinglist');
MailingListData =  new Mongo.Collection('mailinglistdata');
Tracked = new Mongo.Collection('tracked');
Data = new Mongo.Collection('data')
Comments = new Mongo.Collection('comments')

CommentsSchema = new SimpleSchema({
    createdAt: {
      type: Date,
      label: "Created At",
      optional: true,
      autoValue: function() {
        return new Date();
      },
    },
    createdBy: {
      type: String,
      label: "Created At",
      autoValue: function() {
        return Meteor.userId();
      },

    },
    contentID:{
      type:String,    
    },
    comment:{
      type: String
    }  
  })
  
  DataSchema = new SimpleSchema({
    name:{
      type:String
    },
    data:{
      type: Object,
      blackbox: true,
    }
  })
  
  MalingListDataSchema = new SimpleSchema({
    contentID : {
      type:String
    },
    emails : {
      type: Array
    },
    createdAt:{
      type: Date,
      label: "Created At",
      optional: true,
      autoValue: function() {
        return new Date();
      },
    },
    'emails.$':{
      type: Object,
      blackbox: true,
    },
  });
  
  
  
  MailingListSchema = new SimpleSchema({
    eMail:{
      type:String,
      regEx: SimpleSchema.RegEx.Email
    },
    subscribed:{
      type: Boolean,
    }
  });

  TrackedSchema = new SimpleSchema({
    trackedID:{
      type: String
    },
    isTracked:{
      type: Boolean
    }
  });

  BlogSchema = new SimpleSchema({
    createdAt: {
      type: Date,
      label: "Created At",
      optional: true,
      autoValue: function() {
        return new Date();
      },

    },
    createdBy: {
      type: String,
      label: "Created At",
      autoValue: function() {
        return Meteor.userId();
      },

    },
    title:{
      type: String,
      label: "Post Title",
    },
  
    imgUrl:{
      type: String,
      label: "Image"
    },
    videoID:{
      type: String,
      label: "videoUrl",
      optional: true,
  
    },
    keywords:{
      type:String,
      label: "Keywords",
    },
    excerpt:{
      type: String,
      label: "excerpt"
    },
    blog:{
      type: String,
      optional:true,
      label: "Post",
    },
    images:{
      type: Array,
      optional:true
    },
    'images.$':{
      type:Object,
      blackbox: true
    },
    body:{
      type: Array,
      optional:true
    },
    'body.$':{
      type:Array
    },
    'body.$.$':{
      type:Object
    },
    'body.$.$.size':{
      type:String
    },
    'body.$.$.css':{
      type:Array,
    },
    'body.$.$.css.$':{
      type:Object,
      blackbox:true,
      optional: true
    },
    'body.$.$.type':{
      type: String
    },
    'body.$.$.data':{
      type: Object,
      blackbox: true,
      optional:true
    },
  
    category:{
      type:String,
      label: 'Category',
      optional:true,
    },
    isDraft:{
      type:Boolean
    }
  });

  PageSchema = new SimpleSchema({
    slug:{
      type:String,
      optional:true,
    },
    createdAt: {
      type: Date,
      label: "Created At",
      optional: true,
      autoValue: function() {
        return new Date();
      },
    },
    createdBy: {
      type: String,
      label: "Created At",
      autoValue: function() {
        return Meteor.userId();
      },

    },
    title:{
      type: String,
      label: "Post Title",
    },
    imgUrl:{
      type: String,
      label: "Image"
    },
    videoID:{
      type: String,
      label: "videoId",
      optional: true,
    },
    keywords:{
      type:String,
      label: "Keywords",
    },
    excerpt:{
      type: String,
      label: "excerpt"
    },
    content:{
      type: String,
      label: "Post",

      
    },
    images:{
      type: Array,
      optional:true
    },
    'images.$':{
      type:Object,
      blackbox: true
    },
    body:{
      type: Array,
      optional:true
    },
    'body.$':{
      type:Array
    },
    'body.$.$':{
      type:Object
    },
    'body.$.$.size':{
      type:String
    },
    'body.$.$.css':{
      type:Array,
    },
    'body.$.$.css.$':{
      type:Object,
      blackbox:true,
      optional: true
    },
    'body.$.$.type':{
      type: String
    },

  });

  if (Meteor.isServer) {

    Meteor.publish('data', function dataPublication(names) {
      //takes an arrray of data points to return.
      toReturn = [];
      names.forEach((doc)=>{
        toReturn.push(Data.find({name:doc}))
      })
      return toReturn;
    });
  
    Meteor.publish('blogConsole', function BlogConsoleInfo() {
      return [
        Meteor.users.find({},{fields:{username:1}}),
        Pages.find({}, {fields:{
          title:1,
          _id:1,
        }}),
        Blog.find({}, {fields:
          {
            title:1,
            imgUrl:1,
            keywords:1,
            excerpt:1,
            category:1,
            createdBy:1,
            createdAt:1,
            isDraft:1,
          }})   
      ];
    });
  
    Meteor.publish('blogPreviews', function blogusersPublication(draft=false) {
      return [
        Meteor.users.find({},{fields:{username:1}}),
        Blog.find({}, {fields:
          {
            title:1,
            imgUrl:1,
            keywords:1,
            excerpt:1,
            category:1,
            createdBy:1,
            createdAt:1,
            isDraft:1,
          }})   
        ] 
    });

    Meteor.publish('users', function blogusersPublication() {
      return Meteor.users.find({});
    });
  
    Meteor.publish('mailinglistdata', function mailinglistDataPublication() {
      return MailingListData.find({});
    });
  
    Meteor.publish('tracked', function trackedPublication() {
      return Tracked.find({});
    });
    
    Meteor.publish('mailinglist', function trackedPublication() {
      return MailingList.find({});
    });

}
  
  
Comments.attachSchema( CommentsSchema );
Data.attachSchema(DataSchema);
MailingListData.attachSchema ( MalingListDataSchema );
MailingList.attachSchema( MailingListSchema );
Tracked.attachSchema( TrackedSchema );
Blog.attachSchema( BlogSchema );
Pages.attachSchema( PageSchema )
