// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by blog.js.
import { name as packageName } from "meteor/blog";

// Write your tests here!
// Here is an example.
Tinytest.add('blog - example', function (test) {
  test.equal(packageName, "blog");
});
