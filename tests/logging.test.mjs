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
 * This file tests loggers.
 */

import {ConsoleLogger, StringLogger} from "../generated/logging.mjs";

test("Write to console logger (visual verification)", () => {
    // Just verify that something gets written to the console.
    const logger = new ConsoleLogger(["test"]);
    logger.log("test", "Test message in console logger.")
});

test("Test writing to topics", () => {
    const logger = new StringLogger(["1"]);

    // Test basic logging against original topics.
    logger.log("1", "log_msg1");
    logger.log("2", "log_msg2");

    expect(logger.contains("log_msg1")).toBeTruthy();
    expect(logger.contains("log_msg2")).toBeFalsy();
    expect(logger.contains("log_msg", false)).toBeFalsy();
    expect(logger.contains("log_msg")).toBeTruthy();

    // Test clearing the log.
    logger.clear();
    expect(logger.contains("log_msg1")).toBeFalsy();

    // Test adding and removing a topic.
    logger.removeTopic("1");
    logger.addTopic("3");

    logger.log("1", "log_msg1");
    logger.log("2", "log_msg2");
    logger.log("3", "log_msg3");

    expect(logger.contains("log_msg1")).toBeFalsy();
    expect(logger.contains("log_msg2")).toBeFalsy();
    expect(logger.contains("log_msg3")).toBeTruthy();
});
