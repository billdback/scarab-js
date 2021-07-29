"use strict";

/**
 * Scarab.js (c) 2021, William D. Back.  All rights reserved.
 * This software is released under the ISC license.
 *
 * Scarab.js is a framework for quickly and easily creating entity-based, discrete event simulations.  The focus is on
 * speed and ease of creating and running simulations, with performance being second.
 *
 * Any properties beginning with an underscore (_) are assumed to be private and should not be directly modified.
 * Changes may cause unwanted side-effects.
 *
 * This file contains various queues used by the simulation.  Most simulation users won't need to use these classes
 * directly.
 */

import { assert } from "./util";
import { Event } from "./events";

/**
 * PriorityQueue queue events based on a predefined list of event name priorities.  Add events in any order and then
 * retrieve them in the order based on:
 * 1. priority name (prority one events are returned before priority 2 events)
 * 2. order of insertion for events at the same priority level.
 * This queue is not typically used directly, but is a helper for the EventQueue.
 */
class PriorityQueue {
    protected _priorityList: string[];
    private _eventQueues: { [key: string]: Event[] };
    private _length: number;

    /**
     * Creates a new PriorityQueue with the given priorities.  Note that a wildcard priority is always added to the
     * end to catch priorities not otherwise handled.
     * @param priorityList Array of regular expressions to define priority in priority from highest to lowest.
     */
    constructor(priorityList: string[]) {
        this._priorityList = [];
        this._eventQueues = {};
        this._length = 0; // counter to make getting the length faster.
        this.setPriorities(priorityList);  // List of event types in priority order.
    }

    /**
     * Sets the priority list.
     * @param priorityList Array of regular expressions to define priority in priority from highest to lowest.
     */
    setPriorities(priorityList: string[]): void {
        // sets the priority of events within a timeslice.  Setting this direclty may cause errors or unexpected
        // behavior.

        this._priorityList = Array.from(priorityList);  // List of event types in priority order.
        if (!("*" in priorityList)) {
            this._priorityList.push(""); // make sure there's a wildcard option as a catch-all.
        }

        this._eventQueues = {} // queue of events for each priority.
        for (const eventName of this._priorityList) {
            this._eventQueues[eventName] = [];  // add a new, empty list.  This should ensure there is always something.
        }
    }

    /**
     * Adds and event to the queue.
     * @param event A member of the Event class (or any object with a name attribute).
     */
    add(event: Event): void {
        // Find the first priority queue that matches the name.  Note that priorities can be patterns.
        // There will always be a wildcard queue at the end that matches all other names.
        const queueName = this._priorityList.find(value => RegExp(value).test(event.name));
        const queue = this._eventQueues[queueName];
        queue.push(event);
        this._length++;
    }

    /**
     * Returns the next event in the queue based on priority and then order added.
     * @returns {null|*}
     */
    next(): Event|null {
        // Returns the next item in the list based on the priorities.  If the queue is empty, return "null".
        if (this.length === 0) return null;

        for (const queueName of this._priorityList) {
            const queue = this._eventQueues[queueName];
            if (queue.length > 0) {
                this._length--;
                return queue.shift();  // return the first in the queue for FIFO behavior withing the priority.
            }
        }
        return null;  // shouldn't happen, but need a case.
    }

    /**
     * Returns the number of events in the queue.
     * @returns {number} The number of events in the queue.
     */
    get length(): number {
        // Returns the number of events currently in the queue.
        return this._length;
    }

    /**
     * Returns true if the queue is empty.
     * @returns {boolean}
     */
    isEmpty(): boolean {
        return this._length === 0;
    }
}

/**
 * Strict version of the PriorityQueue (q.v.)
 * Strict versions of classes include additional asserts to make sure expectations are met at runtime.  These can be
 * slower, so you can test with the strict class and then use the non-strict class for better performance.
 */
class StrictPriorityQueue extends PriorityQueue {

    /**
     * Creates a new, strict priority queue.
     * @param priorityList The order to retrieve events within a given time slot.
     */
    constructor(priorityList: string[]) {
        assert(Array.isArray(priorityList), `Priority list '${priorityList}' is not an array.`)
        super(priorityList);
    }

    /**
     * Sets the priority list.
     * @param priorityList Array of regular expressions to define priority in priority from highest to lowest.
     */
    setPriorities(priorityList:string[]): void {
        // TODO add support for reconfiguring priorities.
        assert(this._priorityList.length === 0, "Updating priority list not currently supported.");
        super.setPriorities(priorityList);
    }

    /**
     * Adds and event to the queue.
     * @param event A member of the Event class (or any object with a name attribute).
     */
    add(event:Event): void {
        assert(event.name, "Events must have a name.");
        super.add(event);
    }
}

/**
 * The event queue is the main queue for simulation events.  It expects events to be added with a name and specific
 * time to occur (usually the next time).  If the event doens't have a time, it will automatically be set to the next
 * time.  Events will then be retrieved from the queue based on 1) time, and 2) priority list.  The event queue uses
 * priority queues for managing event priorities.
 */
class EventQueue {
    private readonly _priorityList: string[];
    private readonly _timeQueues: {[key: number]: PriorityQueue};
    private _length: number;
    private _currentQueue: PriorityQueue;
    protected _currentTime: number;
    private _nextTime: number;

    /**
     * Creates a new event queue.
     * @param priorityList The order to retrieve events within a given time slot.
     */
    constructor(priorityList: string[]) {
        this._priorityList = priorityList; // Priority of events within a time.
        this._timeQueues = {}      // Sparse array of queues indexed by time.  The values are PriorityQueues.
        this._length = 0;         // number of events in the queue.
        this._currentQueue = null; // Queue currently being used.  Avoids constant retrieval from the list.
        this._currentTime = 0;    // Current time of events in the queue.
                                   // A time of zero only initially before events are returned.

        // The next time for an event in the queue.  This can be the same as current time.  Initially it's unknown.
        this._nextTime = undefined;
    }

    /**
     * Returns the number of events in the queue.
     * @returns {number}
     */
    get length(): number {
        return this._length;
    }

    /**
     * Returns true if the queue is empty, i.e. no more events.
     * @returns {boolean}
     */
    get isEmpty(): boolean {
        return this._length === 0;
    }

    /**
     * Return the time of the next event in the queue.
     * @returns {number}
     */
    get nextTime(): number {
        return this._nextTime;
    }

    /**
     * Adds an event to the queue.  The time for the event is determined as follows:
     * 1. If the time parameter is provided, then use that.  The time must be in the future.
     * 2. If the time parameter is not provided, look for an event.time property.
     * 3. Set the event to occur at the next time interval.
     * For options 1 and 3, the time will be set in the event as a property, overwriting any property that might exist.
     * This approach allows event writers to generally be able to ignore times unless they are set into the future.
     * @param event  The event to add.  All events much have names or an error will be thrown.
     * @param time An optional time for the event vs. having to set it in the event.
     */
    add(event: Event, time: number|null|undefined): void {

        // figure out the time to be used.
        let timeToUse;
        if (time) {
            timeToUse = time;
        }
        else if (event.time) {
            timeToUse = event.time;
        }
        else {
            timeToUse = this._currentTime + 1;
        }

        if (! this._nextTime) { // If the next time was unknown, set it to this time since it's now known.
            this._nextTime = timeToUse;
        }

        // Time is OK, so set the time in the event (just to be sure) and add to the queue.
        event.time = timeToUse;
        let queue = this._timeQueues[timeToUse];
        if (!queue) {
            queue = new PriorityQueue(this._priorityList);
            this._timeQueues[timeToUse] = queue;
        }
        queue.add(event);

        this._length++;
    }

    /**
     * Returns the next event based on time.  If the queue is empty, undefined will be returned.
     * @returns {null|*}
     */
    next(): Event|null {
        if (this._length === 0) {  // There are no more events.
            // Note that the current time is not reset.  New events still have to occur in the future.
            return null;
        }

        // Find the next available queue.  Sets the min time to be used.
        while (!this._currentQueue) {
            this._currentTime++;
            this._currentQueue = this._timeQueues[this._currentTime];
        }

        // Remove the current queue, so it's not accessed again.
        delete(this._timeQueues[this._currentTime]);
        this._nextTime = this._currentTime; // next time is the same as current time until events are gone.

        // Get the next event from the queue.
        const evt = this._currentQueue.next();
        this._length--;

        // If the queue is empty (last item removed), then delete so the next time a new queue will be returned.
        if (this._currentQueue.isEmpty()) {
            this._currentQueue = null;
            // if there are no more events, then the next time is undefined since an
            // event can be any time in the future.
            if (this._length === 0) {
                this._nextTime = undefined;
            }
            // if not, then the time is time of the next event queue.
            else {  // Set the next time to the next queue.
                this._nextTime = Math.min(...Object.keys(this._timeQueues).map(Number));
            }
        }

        return evt;
    }
}

/**
 * Strict version of the EventQueue (q.v.)
 * Strict versions of classes include additional asserts to make sure expectations are met at runtime.  These can be
 * slower, so you can test with the strict class and then use the non-strict class for better performance.
 */
class StrictEventQueue extends EventQueue {

    /**
     * Creates a new, strict event queue.
     * @param priorityList The order to retrieve events within a given time slot.
     */
    constructor(priorityList: string[]) {
        assert(Array.isArray(priorityList), `Priority list '${priorityList}' is not an array.`)
        super(priorityList);
    }

    add(event: Event, time: number|null|undefined): void {
        assert(event.name, "Events must have a name.");

        if (time || event.time) { // could be empty, so next time will be used.
            const timeToUse = time? time : event.time;
            assert(Number.isInteger(timeToUse), `Time ${timeToUse} is not an integer.`)
            // validate the timeToUse, i.e. not in the past.
            assert(timeToUse > this._currentTime,
                `Time ${timeToUse} is before current timeToUse (${this._currentTime})`);
        }
        super.add(event, time);
    }
}

export { EventQueue, StrictEventQueue, PriorityQueue, StrictPriorityQueue };
