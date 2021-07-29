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
 * This file contains the classes the define and represent entities.
 * Note that entity names starting with "scarab" are reserved for the framework.
 *
 */
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

import { assert } from "./util";
import { EntityRef, Event } from "./events";

interface EventHandlerFunction {
    (event: Event): any;
}

interface EntityCreatedHandlerFunction {
    (entity: EntityRef): any;
}

interface EntityDestroyedHandlerFunction {
    (entity: EntityRef): any;
}

interface EntityUpdatedHandlerFunction {
    (entity: EntityRef, updatedProperties: string[]): any;
}

/**
 * Base class for all events.  Events are simply objects with a name, time to occur, and then any additional properties.
 * Events are used to communicate between entities in the simulation.
 * This class can be used directly to create events on the fly.
 */
class EntityDescription {
    public readonly name;
    public readonly guid;
    public readonly _eventHandlers: {[key: string]: EventHandlerFunction[]};
    public readonly _entityCreatedHandlers: {[key: string]: EntityCreatedHandlerFunction[]};
    public readonly _entityDestroyedHandlers: {[key: string]: EntityDestroyedHandlerFunction[]};
    public readonly _entityUpdatedHandlers: {[key: string]: EntityUpdatedHandlerFunction[]};

    /**
     * Creates a new event with a name (required) and optional time.
     * @param name  The name (i.e. type) of event.  It's recommended to have a naming convention.
     * simulation time.
     * @param properties An optional set of properties with initial values to use as defaults.  Entities can override
     * the properties.
     */
    constructor(name: string, properties: {[key: string]: any} = {}) {
        this.name = name;
        this.guid = uuidv4();

        // Copy any properties.
        Object.assign(this, properties);

        // Standard types of event handlers.
        this._eventHandlers = {};  // Handlers for general events. Event name: handler.  Includes sim events.
        this._entityCreatedHandlers = {}; // Handlers for entity creation.  Entity name: handler
        this._entityDestroyedHandlers = {}; // Handlers for entity destruction.  Entity name: handler
        this._entityUpdatedHandlers = {};  // Handlers for entity updates.  Entity name: handler
    }

    /**
     * Adds a handler to the dictionary.  The pattern is the same for all handler dictionaries.
     * @param dict The dictionary to add to.
     * @param name The name of the thing to add.
     * @param handler The handler function.  The original caller should do any validation.
     * @private
     */
    _addToHandlerToHandlers (dict: {[key: string]: any}, name: string, handler: any) {
        let handlers = dict[name];
        if (! handlers) {
            handlers = [];
            dict[name] = handlers;
        }
        handlers.push(handler);
    }

    /**
     * Adds an event handler for the event of the given name.  Note that you can have multiple handlers for one event.
     * @param eventName The name of the event.
     * @param eventHandler The handler which is a function of the form
     */
    onEvent (eventName: string, eventHandler: EventHandlerFunction) {
        assert(eventName, "An event name must be provided for an event handler");
        this._addToHandlerToHandlers(this._eventHandlers, eventName, eventHandler);
    }

    /**
     * Adds an entity created handler to the entity description.
     * @param entityName The name of the entity being created.
     * @param entityCreatedHandler The handler for the entity.
     */
    onEntityCreated(entityName: string, entityCreatedHandler: EntityCreatedHandlerFunction) {
        assert(entityName, "An entity name must be provided for an entity created handler");
        this._addToHandlerToHandlers(this._entityCreatedHandlers, entityName, entityCreatedHandler);
    }

    /**
     * Adds an entity destroyed handler to the entity description.
     * @param entityName The name of the entity being destroyed.
     * @param entityDestroyedHandler The handler for the entity.
     */
    onEntityDestroyed(entityName: string, entityDestroyedHandler: EntityDestroyedHandlerFunction) {
        assert(entityName, "An entity name must be provided for an entity destroyed handler");
        this._addToHandlerToHandlers(this._entityDestroyedHandlers, entityName, entityDestroyedHandler);
    }

    /**
     * Adds an entity updated handler to the entity description.
     * @param entityName The name of the entity being updated.
     * @param entityUpdatedHandler The handler for the entity.
     */
    onEntityUpdated(entityName: string, entityUpdatedHandler: EntityUpdatedHandlerFunction) {
        assert(entityName, "An entity name must be provided for an entity updated handler");
        this._addToHandlerToHandlers(this._entityUpdatedHandlers, entityName, entityUpdatedHandler);
    }

    /**
     * Creates a new entity from the description.
     * @param properties An optional set of properties for the entity.
     */
    entity(properties: {[key: string]: any} = {}): Entity {
        return new Entity(this, properties);
    }
}

/**
 * Represents an individual entity that has state and responds to events.  This should typically only be created from
 * description class.
 */
class Entity {
    public readonly name: string;
    public readonly guid: string;
    private readonly _eventHandlers: {[key: string]: EventHandlerFunction[]};
    public readonly _entityCreatedHandlers: {[key: string]: EntityCreatedHandlerFunction[]};
    public readonly _entityDestroyedHandlers: {[key: string]: EntityDestroyedHandlerFunction[]};
    public readonly _entityUpdatedHandlers: {[key: string]: EntityUpdatedHandlerFunction[]};

    /**
     * Creates a new Entity object from a description.  Note that after the creation of an entity, changes to the
     * description will not change the entity.
     * @param description The description of the entity.
     * @param properties An optional set of properties to add to or override any defaults.
     */
    constructor(description: EntityDescription, properties: {[key: string]: any} = {}) {
        Object.assign(this, description);  // copy default properties.
        Object.assign(this, properties);   // override/extend with any properties that were passed.
        this.guid = uuidv4();  // need to override with a new GUID to not reuse the description.

        // Standard types of event handlers.
        this._eventHandlers = {};  // Handlers for general events. Event name: handler.  Includes sim events.
        this._entityCreatedHandlers = {}; // Handlers for entity creation.  Entity name: handler
        this._entityDestroyedHandlers = {}; // Handlers for entity destruction.  Entity name: handler
        this._entityUpdatedHandlers = {};  // Handlers for entity updates.  Entity name: handler

        this._copyHandlers(description);
    }

    /**
     * Copies the handlers from the entity description into the entity and binds with this of the entity.
     * @param description The entity description to copy from.
     */
    _copyHandlers(description: EntityDescription) {
        // TODO create a copy and bind function that takes the ED handlers, the new handlers, and the does copy/bind.

        for (const eventName in description._eventHandlers) {  // copy event handlers.
            const handlers: EventHandlerFunction[] = [];
            for (let h of description._eventHandlers[eventName]) {
                h = h.bind(this);
                handlers.push(h);
            }
            this._eventHandlers[eventName] = handlers;
        }

        for (const entityName in description._entityCreatedHandlers) {  // copy entity handlers.
            const handlers: EntityCreatedHandlerFunction[] = [];
            for (let h of description._entityCreatedHandlers[entityName]) {
                h = h.bind(this);
                handlers.push(h);
            }
            this._entityCreatedHandlers[entityName] = handlers;
        }

        for (const entityName in description._entityDestroyedHandlers) {  // copy entity handlers.
            const handlers: EntityDestroyedHandlerFunction[] = [];
            for (let h of description._entityDestroyedHandlers[entityName]) {
                h = h.bind(this);
                handlers.push(h);
            }
            this._entityDestroyedHandlers[entityName] = handlers;
        }

        for (const entityName in description._entityUpdatedHandlers) {  // copy entity handlers.
            const handlers: EntityUpdatedHandlerFunction[] = [];
            for (let h of description._entityUpdatedHandlers[entityName]) {
                h = h.bind(this);
                handlers.push(h);
            }
            this._entityUpdatedHandlers[entityName] = handlers;
        }
    }

    /**
     * Handles an event if there is a handler.
     * @param event The event to handle.
     */
    handleEvent(event: Event): void {
        const handlers = this._eventHandlers[event.name]
        if (handlers) {  // this entity handles these events.
            for (const h of handlers) { // call each handler
                h(event);
            }
        }
    }

    /**
     * Handles an entity creation if there is a handler.
     * @param entity The entity created.
     */
    handleEntityCreated(entity: EntityRef): void {
        const handlers = this._entityCreatedHandlers[entity.name]
        if (handlers) {  // this entity handles these events.
            for (const h of handlers) { // call each handler
                h(entity);
            }
        }
    }

    /**
     * Handles an entity creation if there is a handler.
     * @param entity The entity destroyed.
     */
    handleEntityDestroyed(entity: EntityRef): void {
        const handlers = this._entityDestroyedHandlers[entity.name]
        if (handlers) {  // this entity handles these events.
            for (const h of handlers) { // call each handler
                h(entity);
            }
        }
    }

    /**
     * Handles an entity creation if there is a handler.
     * @param entity The entity created.
     * @param updatedProperties A list of the properties that changed.  Currently assumes properties don't get
     * added or removed.
     */
    handleEntityUpdated(entity: EntityRef, updatedProperties: string[]): void {
        const handlers = this._entityUpdatedHandlers[entity.name]
        if (handlers) {  // this entity handles these events.
            for (const h of handlers) { // call each handler
                h(entity, updatedProperties);
            }
        }
    }
}

export {
    EventHandlerFunction,
    EntityCreatedHandlerFunction,
    EntityDestroyedHandlerFunction,
    EntityUpdatedHandlerFunction,
    Entity,
    EntityDescription
};
