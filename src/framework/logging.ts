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
 * This file contains classes and functions to aid with trace logging of events and simulation activity.
 * TODO - add more instructions on how to use.
 *
 */

/**
 * Defines a base logger with common functionality.  All loggers work on topics that are enabled or not.  If enabled,
 * then log messages to that topic will be displayed in the means that the logger defines.  The BaseLogger creates an
 * abstract version of "write" that will fail.  Specific loggers will log.
 */
class BaseLogger {
    private _topics: Set<string>;

    /**
     * Creates a new topics class with the pre-defined topics.
     * @param topics Optional list of topics to start with enabled.
     */
    constructor(topics: string[] = []) {
        this._topics = new Set<string>();
        for (const t of topics) {
            this._topics.add(t);
        }
    }

    /**
     * Checks to see if a topic is being logged.
     * @param topic The topic to check for.
     */
    isLogging(topic: string): boolean {
        return (topic in this._topics);
    }

    /**
     * Adds a topic to be logged.
     * @param topic The topic to be logged.
     */
    addTopic (topic: string) {
        this._topics.add(topic);
    }

    /**
     * Removes a topic from logging.
     * @param topic The topic to remove.  If the topic isn't being logged, it will be ignored.
     */
    removeTopic(topic: string) {
        this._topics.delete(topic);
    }

    /**
     * Logs a message to a topic.
     * @param topic The topic to log on.  Only active topics will be written to.
     * @param message The message to write.
     */
    log(topic: string, message: string) {
        if (this._topics.has(topic)) {
            this._write(message);
        }
    }

    /**
     * Writes the message to the log.  This is an abstract method that will throw an error.  Override in loggers.
     * NOTE:  Code should be calling log(topic, message) instead of write.
     * @param message The message to write.
     */
    _write(message: string) {
        throw TypeError(`Can't write "${message}" from base class.`)
    }
}

/**
 * Writes messages to console.log.
 */
class ConsoleLogger extends BaseLogger {

    /**
     * Writes message to the console.
     * @param message
     */
    _write(message: string): void {
        console.log(message);
    }
}

/**
 * Logs messages to a string for later retrieval.  Ideal for testing.
 */
class StringLogger extends BaseLogger {
    private _buffer: string[];

    /**
     * Creates a new StringLogger.
     * @param topics List of topics to log on.
     */
    constructor(topics: string[] = []) {
        super(topics);
        this._buffer = [];
    }

    /**
     * Writes the message to the log.
     * @param message
     */
    _write(message: string) {
        this._buffer.push(message);
    }

    /**
     * Returns the current contents of the logger.
     */
    strings(): string[] {
        return Array.from(this._buffer); // return a copy of the log.
    }

    /**
     * Clears out the string log buffer.
     */
    clear(): void {
        this._buffer = [];
    }

    /**
     * Returns true if the log buffer contains the given string.
     * @param value The value to check for.
     * @param checkSubstr If true (default), checks substrings.
     */
    contains(value: string, checkSubstr: boolean = true): boolean {
        for (const s of this._buffer) {
            if (checkSubstr) {
                if (s.includes(value)) {
                    return true;
                } else {
                    if (s === value) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

export { StringLogger, ConsoleLogger };
