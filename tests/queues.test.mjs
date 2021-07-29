"use strict";

/*
 * Scarab.js (c) 2021, William D. Back.  All rights reserved.
 * This software is released under the ISC license.
 *
 * Scarab.js is a framework for quickly and easily creating entity-based, discrete event simulations.  The focus is on
 * speed and ease of creating and running simulations, with performance being second.
 *
 * Any properties beginning with an underscore (_) are assumed to be private and should not be directly modified.
 * Changes may cause unwanted side-effects.
 *
 * This file tests the queues classes and methods.
 */

// Using the strict versions.  Code coverage should be the same.
import {StrictEventQueue, StrictPriorityQueue} from "../generated/queues.mjs";

// PriorityQueue tests =============================================================================================

test("create and use a priority queue with unique events", () => {
    const queue = new StrictPriorityQueue(["a", "b", "c"]);

    queue.add({name: "a"});
    queue.add({name: "c"});
    queue.add({name: "e"});
    queue.add({name: "b"});

    expect(queue.length).toBe(4);

    let evt = queue.next();
    expect(evt.name).toBe("a");
    expect(queue.length).toBe(3);

    evt = queue.next();
    expect(evt.name).toBe("b");
    expect(queue.length).toBe(2);

    evt = queue.next();
    expect(evt.name).toBe("c");
    expect(queue.length).toBe(1);

    evt = queue.next();
    expect(evt.name).toBe("e");
    expect(queue.length).toBe(0);

    evt = queue.next();
    expect(evt).toBeNull();
    expect(queue.length).toBe(0);
});

test("Create and use a priority queue with multiple events that match", () => {
    const queue = new StrictPriorityQueue(["a", "b", "c"]);
    expect(queue.length).toBe(0);

    // events being added (in order to be returned) a, a, a, b, b, c, c, d, d

    queue.add({name: "d"})
    queue.add({name: "d"})
    expect(queue.length).toBe(2);

    queue.add({name: "a"})
    queue.add({name: "a"})
    queue.add({name: "a"})
    expect(queue.length).toBe(5);

    let evt = queue.next();
    expect(evt.name).toBe("a");
    expect(queue.length).toBe(4);

    queue.add({name: "c"})
    queue.add({name: "b"})
    expect(queue.length).toBe(6);

    evt = queue.next();
    expect(evt.name).toBe("a");
    expect(queue.length).toBe(5);

    queue.add({name: "b"})
    queue.add({name: "c"})
    expect(queue.length).toBe(7);

    // current state should be a, b, b, c, c, d

    evt = queue.next();
    expect(evt.name).toBe("a");
    expect(queue.length).toBe(6);

    evt = queue.next();
    expect(evt.name).toBe("b");
    expect(queue.length).toBe(5);

    evt = queue.next();
    expect(evt.name).toBe("b");
    expect(queue.length).toBe(4);

    evt = queue.next();
    expect(evt.name).toBe("c");
    expect(queue.length).toBe(3);

    evt = queue.next();
    expect(evt.name).toBe("c");
    expect(queue.length).toBe(2);

    evt = queue.next();
    expect(evt.name).toBe("d");
    expect(queue.length).toBe(1);

    evt = queue.next();
    expect(evt.name).toBe("d");
    expect(queue.length).toBe(0);
});

test("Create and use a priority queue with priority patterns", () => {
    const queue = new StrictPriorityQueue(["^a.*", "^b.*", "^c.*"]);

    // Add just the basic without following values.
    queue.add({name: "b"});
    queue.add({name: "c"});
    queue.add({name: "d"});
    queue.add({name: "a"});

    expect(queue.length).toBe(4);

    // Now add with patterns.
    queue.add({name: "cat"});
    queue.add({name: "dog"});
    queue.add({name: "bird"});
    queue.add({name: "anaconda"});

    expect(queue.length).toBe(8);

    // a, anaconda, b, bird, c, cat, d, dog
    let evt = queue.next();
    expect(evt.name).toBe("a");
    expect(queue.length).toBe(7);

    evt = queue.next();
    expect(evt.name).toBe("anaconda");
    expect(queue.length).toBe(6);

    evt = queue.next();
    expect(evt.name).toBe("b");
    expect(queue.length).toBe(5);

    evt = queue.next();
    expect(evt.name).toBe("bird");
    expect(queue.length).toBe(4);

    evt = queue.next();
    expect(evt.name).toBe("c");
    expect(queue.length).toBe(3);

    evt = queue.next();
    expect(evt.name).toBe("cat");
    expect(queue.length).toBe(2);

    evt = queue.next();
    expect(evt.name).toBe("d");
    expect(queue.length).toBe(1);

    evt = queue.next();
    expect(evt.name).toBe("dog");
    expect(queue.length).toBe(0);

    evt = queue.next();
    expect(evt).toBeNull();
    expect(queue.length).toBe(0);
});

test("Use non-array for priority list", () => {
    expect(() => { new StrictPriorityQueue("priorities")})
        .toThrow("Priority list 'priorities' is not an array");
});

test("Try to reset a priority queue", () => {
    const queue = new StrictPriorityQueue(["a", "b"]);
    expect(() => { queue.setPriorities(["c", "d"])})
        .toThrow("Updating priority list not currently supported.");
});

test("Set an event with no name", () => {
    const queue = new StrictPriorityQueue([]);
    expect(() => {queue.add({})}).toThrow("Events must have a name.");
});

// EventQueue tests ================================================================================================

test ("Test using the event queue as designed", () => {
    const queue = new StrictEventQueue(["a", "b", "c"]);

    expect(queue.length).toBe(0);
    expect(queue.nextTime).toBeUndefined();  // There are no events, so the next one is undefined.

    queue.add({name: "b"});
    queue.add({name: "a"});

    expect(queue.length).toBe(2);
    expect(queue.nextTime).toBe(1);

    queue.add({name: "c"}, 3);  // skip 2.

    expect(queue.length).toBe(3);
    expect(queue.nextTime).toBe(1); // time didn't change.

    let evt = queue.next();
    expect(evt.name).toBe("a");
    expect(evt.time).toBe(1);
    expect(queue.length).toBe(2);
    expect(queue.nextTime).toBe(1); // time didn't change.

    evt = queue.next();
    expect(evt.name).toBe("b");
    expect(evt.time).toBe(1);
    expect(queue.length).toBe(1);
    expect(queue.nextTime).toBe(3); // time is now for c/3

    evt = queue.next();
    expect(evt.name).toBe("c");
    expect(evt.time).toBe(3);
    expect(queue.length).toBe(0);
    expect(queue.nextTime).toBeUndefined(); // Empty, so times are undefined.

    evt = queue.next();
    expect(evt).toBeNull();
    expect(queue.length).toBe(0);
    expect(queue.nextTime).toBeUndefined();
});

test("Use non-array for priority list", () => {
    expect(() => { new StrictEventQueue("priorities")})
        .toThrow("Priority list 'priorities' is not an array");
});

test("Set an event with no name", () => {
    const queue = new StrictEventQueue([]);
    expect(() => {queue.add({})}).toThrow("Events must have a name.");
});

test("Add events with invalid times", () => {
    const queue = new StrictEventQueue([]);

    expect(() => queue.add({name: "a", time: -1})).toThrow(Error);
    expect(() => queue.add({name: "a"},-1)).toThrow(Error);
});
