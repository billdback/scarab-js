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
 * This file contains the classes for the simulation.
 */

import {
    Entity,
    EventHandlerFunction,
    EntityCreatedHandlerFunction,
    EntityDestroyedHandlerFunction,
    EntityUpdatedHandlerFunction
} from "./entities";
import { Event } from "./events";
import { StrictPriorityQueue } from "./queues";

/**
 * Represents a list of handlers for events.  Each list represents a handler for one pattern.
 * TODO = Figure out how to make more generic for different types of handlers.
 */
class EventHandlerList {
    public eventName: string;
    protected _handlers: {[key: string]: EventHandlerFunction[]};

    /**
     * Creates a new event handler list for a given pattern.
     * @param eventName The name or pattern to match.
     */
    constructor(eventName: string) {
        this.eventName = eventName;  // pattern this handler matches.
        this._handlers = {}           // set of handlers indexed by the entity ID and the value is the handler to call.
    }

    /**
     * Adds a handler for the given entity for an event or other entity.
     * The same handler can be added twice to support multiple handlers for the same event.
     * @param entityGuid The entity GUID (needed to delete).
     * @param handler The handler.
     */
    addHandler(entityGuid: string, handler: EventHandlerFunction) {
        let handlers = this._handlers[entityGuid];
        if (!handlers) {
            handlers = [];
            this._handlers[entityGuid] = handlers;
        }
        handlers.push(handler);
    }

    /**
     * Removes the handlers for an entity.  Used when the entity is destroyed.
     * @param entityGuid The GUID for the entity.
     */
    removeHandlers (entityGuid: string) {
        delete this._handlers[entityGuid];
    }

    /**
     * Calls the handlers for the given event.
     * @param event The event to pass for the entities.
     */
    invoke(event: Event) {
        for (const handlers of Object.values(this._handlers)) {
            for (const h of handlers) {
                try {
                    h(event);
                }
                catch (err: any) {
                    console.error(`Error calling function for ${this.eventName} ${err}`);
                }
            }
        }
    }
}

/**
 * Represents the simulation and manages entity lifecycle and event flow.
 */
class EntitySimulation {
    public name: string;
    public timeStepped: boolean;

    private entities: { [key: string] : Entity };
    private eventQueue: StrictPriorityQueue; // TODO add the ability to use strict and non-strict.

    /**
     * Creates a new simulation.
     * @param name A name for the simululation.  Mainly used for display purposes.
     * @param timeStepped If true, the simulation will be time stepped (one step at a time).
     */
    constructor(name: string = "unknown-simulation", timeStepped: boolean = true) {
        this.name = name;                                        // name for the simulation.
        this.timeStepped = timeStepped;                          // if true, then the simulation is time-stepped

        this.entities = {};                                      // dictionary of GUID to entity mapping.
        this.eventQueue = new StrictPriorityQueue([]); // queue for events
    }

    /**
     * Adds the entity to the simulation so it can receive simulation events and be managed.
     * Other entities will be notified that the entity was created.
     * @param entity The entity to add to the simulation.
     */
    addEntity(entity: Entity) {
        this.entities[entity.guid] = (entity);

        // TODO add the event handlers.
    }

    /**
     * Destroys (removes) and entity and notifies other entities of the destruction.
     * @param entityOrGUID The entity or entity GUID for the entity to destroy.
     * TODO consider if I want to also support passing the entity.
     */
    destroyEntity(entityOrGUID: string | Entity) {
        // TODO remove the entity and all handlers.
        if (entityOrGUID instanceof Entity) {
          delete this.entities[entityOrGUID.guid];
        }
        else { // This will call with any type, but other types will be ignored.
            delete this.entities[entityOrGUID];
        }
    }

    /**
     * Returns the number of entities in the simulation.
     * @returns {number} The number of entities in the simulation.
     */
    numberEntities() : number {
        return Object.keys(this.entities).length;
    }

    sendEvent(event: Event) {

    }

}

export { EntitySimulation };
