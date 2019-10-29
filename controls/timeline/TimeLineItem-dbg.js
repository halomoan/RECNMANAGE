/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	'sap/ui/core/Control'
], function(Control) {
	'use strict';

	return Control.extend('fin.re.conmgmts1.controls.timeline.TimeLineItem', {
		metadata: {
			properties: {
				dateFrom: {
					type: 'object',
					bindable: true
				},
				dateTo: {
					type: 'object',
					bindable: true
				},
				eventType: {
					type: 'string',
					bindable: true
				},
				eventLevel: {
					type: 'float',
					bindable: true
				},
				eventInfo: {
					type: 'string',
					bindable: true
				},
				notifDateTo: {
					type: 'object',
					bindable: true
				}
			},
			events: {
				press: {
					enableEventBubbling: true
				}
			}
		},

		init: function() {},

		ontap: function() {
			this.firePress({});
		}

	});

}, true);
