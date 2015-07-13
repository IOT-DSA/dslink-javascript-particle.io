import { SimpleNode, LinkProvider } from 'dslink';

// .class is not an ES6 convention, it's just part of the SDK for now.
// you'll be able to drop it later when using ES6 classes
class Increment extends SimpleNode.class {
  onInvoke(columns) {
    // get current value of the link
    var previous = link.val('/counter');

    // set new value by adding an amount to the previous amount
    link.val('/counter', previous + parseInt(columns.amount));
  }
}

// Process the arguments and initializes the default nodes.
var link = new LinkProvider(process.argv.slice(2), 'particleio-', {
  defaultNodes: {
    // counter is a value node, it holds the value of our counter
    counter: {
      $type: 'int',
      '?value': 0
    },
    // increment is an action node, it will increment /counter
    // by the specified amount
    increment: {
      // references the increment profile, which makes this node an instance of
      // our Increment class
      $is: 'increment',
      $invokable: 'write',
      // $params is the parameters that are passed to onInvoke
      $params: [
        {
          name: 'amount',
          type: 'int',
          default: 1
        }
      ]
    }
  },
  // register our custom node here as a profile
  // when we use $is with increment, it
  // creates our Increment node
  profiles: {
    increment(path) {
      return new Increment(path);
    }
  }
});

// Connect to the broker.
// link.connect() returns a Promise.
link.connect().catch((e) => {
  console.log(e.stack);
});
