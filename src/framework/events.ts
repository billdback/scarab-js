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
 * This file contains the base class for events along with several pre-defined events used by the simulation.
 * Events may not be directly used by users who can simplay pass an object with attributes as long as they have a
 * name.  In that case, the events will be wrapped in a base event class.  All events sent from the simulation will be
 * of instance type Event.
 *
 * Note that event names starting with "scarab" are reserved for the framework.
 *
 */
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

import { assert } from "./util";

export interface EntityRef {
    name: string,
    guid: uuidv4
}

/**
 * Base class for all events.  Events are simply objects with a name, time to occur, and then any additional properties.
 * Events are used to communicate between entities in the simulation.
 * This class can be used directly to create events on the fly.
 */
class Event {
    public readonly name: string;
    public readonly guid: string;
    public time: number;

    /**
     * Creates a new event with a name (required) and optional time.
     * @param name  The name (i.e. type) of event.  It's recommended to have a naming convention.
     * simulation time.
     * @param properties Optional set of properties that can be added to this event.
     */
    constructor(name: string, properties: {[key: string]: any} = {}) {
        this.name = name;
        this.guid = uuidv4();
        this.time = undefined;

        Object.assign(this, properties);
    }

    /**
     * Sets the time of the event.  Calls that set the time can look like
     * new Event(props).at(time).  Most of the time the time is not provided.
     * @param time The time the event occurs at.
     * @return the event for chaining.
     */
    at(time: number): Event {
        assert(Number.isInteger(time), "Event times must be integers.");
        this.time = time;
        return this;
    }

    /**
     * Creates an event from the object.  The object must have a "name" property or an error is raised.
     * @param obj A standard JS object with at least a "name" property.
     */
    static eventFromObject(obj: {[key: string]: any}): Event {
        assert(obj.name, `${obj} does not contain a "name" property.`);
        const evt = new Event(obj.name);
        // TODO add ability to do deep copies.  Object.assign only copies references.
        Object.assign(evt, obj); // copy the object properties to the new event.
        return evt;
    }
}

/* Possible simulation states. */

const SimulationState = Object.freeze({
    paused: "paused",                 // The simulation has paused.
    resumed: "resumed",               // The simulation has resumed after a pause.
    shutting_down: "shutting_down",   // The simulation is shutting down, so do pre-shutdown stuff.
    starting: "starting",             // The simulation is starting, so do pre-run stuff.
});

/* Events related to the simulation activities. */

export const SIMULATION_STATE_CHANGE_EVENT = "scarab.simulation.state_change";
export const SIMULATION_TIME_ADVANCE_EVENT = "scarab.simulation.time-advance";

export const ENTITY_CREATED_EVENT = "scarab.entity.created";
export const ENTITY_UPDATED_EVENT = "scarab.entity.updated";
export const ENTITY_DESTROYED_EVENT = "scarab.entity.destroyed";

/**
 * Indicates that the simulation has started (or resumed).
 */
class SimulationStateChange extends Event {
    private state: string;  // The state.  Should be one of the SimulationState enum types.

    /**
     * Indicates a simulation has started.
     */
    constructor(state: string) {
        console.assert(state in SimulationState, `Invalid simulation state ${state}.`);
        super(SIMULATION_STATE_CHANGE_EVENT);
        this.state = undefined;
    }
}

/**
 * Indicates that the simulation time has advanced to the new time.
 */
class SimulationTimeAdvance extends Event {

    public previousTime: number;

    /**
     * Indicates a simulation time advance to the new time.
     * Note that the time is already handled by the base event time, which should be the new time.
     * @param previousTime The previous time of the simulation or -1 if unknown.
     */
    constructor(previousTime: number = 0) {
        super(SIMULATION_TIME_ADVANCE_EVENT);
        this.previousTime = previousTime;
    }
}

/* Events related to the simulation entities. */

/**
 * Indicates that an entity has been created.
 */
class EntityCreatedEvent extends Event {
    private entityName: string;
    private entityRef: EntityRef;

    /**
     * Indicates an entity has been created.
     * @param entityName Name of the entity class that was created.
     * @param entityRef The remaining properties of the entity.
     */
    constructor(entityName: string, entityRef: EntityRef) {
        super(ENTITY_CREATED_EVENT);
        this.entityName = entityName;
        this.entityRef = entityRef;
    }
}

/**
 * Indicates that an entity has been updated.
 */
class EntityUpdatedEvent extends Event {
    private entityName: string;
    private entityRef: EntityRef;

    /**
     * Indicates an entity has been updated.
     * @param entityName Name of the entity class that was updated.
     * @param entityRef The remaining properties of the entity.
     */
    constructor(entityName: string, entityRef: EntityRef) {
        super(ENTITY_UPDATED_EVENT);
        this.entityName = entityName;
        this.entityRef = entityRef;
    }
}

/**
 * Indicates that an entity has been destroyed.
 */
class EntityDestroyedEvent extends Event {
    private entityName: string;
    private entityGUID: string;

    /**
     * Indicates an entity has been destroyed.
     * @param entityName Name of the entity class that was destroyed.
     * @param entityGUID The GUID of the entity.
     */
    constructor(entityName: string, entityGUID: uuidv4) {
        super(ENTITY_DESTROYED_EVENT);
        this.entityName = entityName;
        this.entityGUID = entityGUID;
    }
}

export { Event,
    SimulationState, SimulationStateChange, SimulationTimeAdvance,
    EntityCreatedEvent, EntityDestroyedEvent, EntityUpdatedEvent
}
