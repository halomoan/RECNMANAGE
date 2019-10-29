/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*global location*/
sap.ui.define([
	"fin/re/conmgmts1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"fin/re/conmgmts1/model/formatter",
	"fin/re/conmgmts1/util/SelectDataBindingHelper",
	"sap/m/MessageBox",
	"jquery.sap.global"
], function(BaseController, JSONModel, History, formatter, SelectDataBindingHelper, MessageBox, $) {
	"use strict";
	var initDocument = false;
	var initJumpOffWebGUIButton = false;
	var jumpOffWebGuiButtonActive = false;
	return BaseController.extend("fin.re.conmgmts1.controller.Contract", {
		formatter: formatter,
		systemId: null,
		webGUIUrl: null,

		onInit: function() {
			this._bMessageOpen = false;
			var originalBusyDelay = this.getView().getBusyIndicatorDelay();
			var viewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(viewModel, "view");
			this.setModel(new JSONModel({
				events: []
			}), "timeline");
			this.setModel(new JSONModel({
				currentTimeline: []
			}), "currentTimeline");
			this.setModel(new JSONModel({}), "timelineRange");
			this._showOverDueRiminder = false;
			this.getRouter().getRoute("contract").attachPatternMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("systemContract").attachPatternMatched(this._onRouteMatched, this);

			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				viewModel.setProperty("/delay", originalBusyDelay);
			});

			this._reminderPopover = null;
		},

		onExit: function() {
			if (this._reminderPopover) {
				this._reminderPopover.destroy();
			}
		},

		onNavBack: function() {
			var oHistory = History.getInstance();
			var previousHash = oHistory.getPreviousHash();

			if (previousHash === undefined) {
				this.getRouter().navTo("worklist", {}, true);
			} else {
				history.go(-1);
			}
		},

		onAfterRendering: function() {
			this._initObjectBlock();
			this._initConditionBlock();
			this._bindTermsSection();
			var currentFilter = new sap.ui.model.Filter("Current", sap.ui.model.FilterOperator.EQ, "true");
			this._initRenewalTable(currentFilter);
			this._initBreakOptionTable(currentFilter);
			this._bindPartnerSection();
			this._initDocumentSection();
			this._initJumpOffWebGUIButton();
			if (sap.ui.Device.browser.name === "ff") {
				this._initTable4FF();
			}
			this.getModel().setDefaultBindingMode("TwoWay");
		},



		_initRenewalTable: function(filter) {
			var termBlock = this.getView().byId("renewalBlock");
			var renewalList = sap.ui.getCore().byId(termBlock.getSelectedView() + "--" + "renewalList");
			var segmentedButton = sap.ui.getCore().byId(termBlock.getSelectedView() + "--" + "renewalFilter");
			segmentedButton.attachSelect(this._onListSegmentedButtonSelect(renewalList));
			renewalList.attachBeforeRebindTable(this._renderingTableBySegmentedButton(segmentedButton, filter));

		},

		/**
		 * For a smart table UI5 requires the filters to be set before the rebinding (attachBeforeRebindTable, see above).
		 * Chrome does an automatic rebind of the table when the table's data was received after the setting of the filters.
		 * Firefox requires a call to rebindTable to update the filters.
		 * If this is executed in Chrome, it tries to do the rebind before the data is available and false therefore.
		 */
		_initTable4FF: function() {
			var termBlock = this.getView().byId("renewalBlock");
			var breakOptionBlock = this.getView().byId("breakOptionBlock");
			var renewalList = sap.ui.getCore().byId(termBlock.getSelectedView() + "--" + "renewalList");
			var breakOptionList = sap.ui.getCore().byId(breakOptionBlock.getSelectedView() + "--" + "breakOptionList");
			renewalList.rebindTable();
			breakOptionList.rebindTable();
		},

		_initBreakOptionTable: function(filter) {
			var breakOptionBlock = this.getView().byId("breakOptionBlock");
			var breakOptionList = sap.ui.getCore().byId(breakOptionBlock.getSelectedView() + "--" + "breakOptionList");
			var segmentedButton = sap.ui.getCore().byId(breakOptionBlock.getSelectedView() + "--" + "breakOptionFilter");
			segmentedButton.attachSelect(this._onListSegmentedButtonSelect(breakOptionList));
			breakOptionList.attachBeforeRebindTable(this._renderingTableBySegmentedButton(segmentedButton, filter));
		},

		_initJumpOffWebGUIButton: function() {
			var view = this.getView();
			var model = view.getModel();
			model.attachRequestCompleted(function() {
				if (!initJumpOffWebGUIButton) {
					var metaModel = model.getMetaModel();
					if (metaModel.getODataEntitySet("ContractTransactionDataSet")) {
						jumpOffWebGuiButtonActive = true;
					}
					initJumpOffWebGUIButton = true;
				}
			});
		},

		_onListSegmentedButtonSelect: function(list) {
			return function(event) {
				list.rebindTable();
			};
		},

		_bindPartnerSection: function() {
			var sView = this.getView();
			var mainPartnerBlock = sView.byId("mainPartnerBlock");
			mainPartnerBlock.bindElement("MainPartner");
		},

		_renderingTableBySegmentedButton: function(segmentedButton, filter) {
			return function(oEvent) {
				var mBindingParams = oEvent.getParameter("bindingParams");
				if (segmentedButton.getSelectedKey() === "" || segmentedButton.getSelectedKey() === "next") {
					mBindingParams.filters.push(filter);
				}
			};
		},

		_initDocumentSection: function() {
			var view = this.getView();
			var model = view.getModel();
			var that = this;
			model.attachRequestCompleted(function() {
				if (!initDocument) {
					var metaModel = model.getMetaModel();
					var entity = metaModel.getODataEntitySet("ContractDocumentDataSet");
					if (entity.hasOwnProperty("sap:addressable") && entity["sap:addressable"] === "false") {
						view.byId("documentSection").setVisible(false);
					} else {
						var documentListBlock = view.byId("documentListBlock");
						var documentListItem = sap.ui.getCore().byId(documentListBlock.getSelectedView() + "--" +
							"documentListItem");
						var openUploadDocumentDialogButton = sap.ui.getCore().byId(documentListBlock.getSelectedView() + "--" +
							"openUploadDialogButton");
						documentListItem.attachPress(that._onDocumentPress.bind(that));
						openUploadDocumentDialogButton.attachPress(that._onOpenUploadFileDialog.bind(that));
					}
					initDocument = true;
				}
			});
		},

		_onDocumentPress: function(oItem) {
			var serviceUrl = this.getModel().sServiceUrl;
			var rootPath = this.getView().getBindingContext().getPath();
			var documentPath = oItem.getSource().getBindingContext().getPath().replace("ContractDocumentDataSet",
				"Documents");
			var url;
			if (oItem.getSource().getBindingContext().getProperty("Documenttype") === 'URL') {
				var oDataPath = rootPath + documentPath;
				this.getModel().read(oDataPath, {
					success: function(oData) {
						url = oData.Url;
						sap.m.URLHelper.redirect(url, true);

					}
				});
			} else {
				url = serviceUrl + rootPath + documentPath + "/$value";
				window.open(
					url,
					'_blank'
				);
			}
			oItem.stopPropagation();
		},

		_onOpenUploadFileDialog: function(event) {
			if (!this.uploadFileDialog) {
				this.uploadFileDialog = sap.ui.xmlfragment(
					'fin.re.conmgmts1.view.documentblocks.dialog.UploadDocumentDialog', this);
				this.getView().addDependent(this.uploadFileDialog);
			}
			this.uploadFileDialog.open();
		},

		closeUploadFileDialog: function(event) {
			this.uploadFileDialog.close();
		},

		handleUploadPress: function(event) {
			var that = this;
			this.getModel().refreshSecurityToken();
			var csrf = this.getModel().oHeaders['x-csrf-token'];
			var serviceUrl = this.getModel().sServiceUrl;
			var rootPath = this.getView().getBindingContext().sPath; // var bindObject = this.getView().getBindingContext().getObject();
			var uploadPath = serviceUrl + rootPath + "/Documents";
			var oFileUploader = sap.ui.getCore().byId('fileUploader');
			var filename = oFileUploader.getValue();
			var file = $.sap.domById(oFileUploader.getId() + "-fu").files[0];
			var oHeaders = {
				"x-csrf-token": csrf,
				"Slug": filename
			};
			$.ajax({
				type: 'POST',
				url: uploadPath,
				headers: oHeaders,
				cache: false,
				contentType: "application/json",
				dataType: "json",
				processData: false,
				data: file,
				success: function(data) {
					var documentListBlock = that.getView().byId("documentListBlock");
					var documentListItem = sap.ui.getCore().byId(documentListBlock.getSelectedView() + "--" + "documentList");
					documentListItem.rebindTable();
					that.uploadFileDialog.close();
				},
				error: function(data) {
					that._showServiceError(data);
				}
			});

		},

		onRenameContractPress: function(event) {
			this.editContractDialog = sap.ui.xmlfragment(
				'fin.re.conmgmts1.view.contractstermblocks.dialog.EditContractDialog', this);
			this.getView().addDependent(this.editContractDialog);
			this.editContractDialog.open();
		},

		renameContract: function(event) {
			this.getView().getModel().submitChanges();
			// this.getView().getModel().updateBindings();
			this.editContractDialog.close();
			this.editContractDialog.destroy();
		},

		closeRenameContractDialog: function(event) {
			this.editContractDialog.close();
			this.editContractDialog.destroy();
		},

		_showServiceError: function(sDetails) {
			var errorText = this.getResourceBundle().getText("Error.Text");
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			MessageBox.error(
				errorText, {
					id: "serviceErrorMessageBox",
					details: sDetails,
					styleClass: this.getOwnerComponent().getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function() {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);
		},

		_initObjectBlock: function() {
			var objectListBlock = this.getView().byId("objectListBlock");
			var objectList = sap.ui.getCore().byId(objectListBlock.getSelectedView() + "--" + "objectList");
			var objectSlice = sap.ui.getCore().byId(objectListBlock.getSelectedView() + "--" + "objectSlice");
			SelectDataBindingHelper.initBlockWithTimeSlice(objectList, objectSlice, "Objects", "ObjectSlice");
		},

		_initConditionBlock: function() {
			var conditionListBlock = this.getView().byId("conditionListBlock");
			var conditionList = sap.ui.getCore().byId(conditionListBlock.getSelectedView() + "--" + "conditionList");
			var conditionSlice = sap.ui.getCore().byId(conditionListBlock.getSelectedView() + "--" + "conditionSlice");
			SelectDataBindingHelper.initBlockWithTimeSlice(conditionList, conditionSlice, "Conditions", "ConditionSlice");
		},

		_onRouteMatched: function(oEvent) {
			var navTarget = oEvent.getParameter("name");
			var args = oEvent.getParameter("arguments");
			this.getModel().metadataLoaded().then(function() {
				var keyObject = this._getKeyObjectFromRouting(navTarget, args);
				var sPath = "/" + this.getModel().createKey("ContractDataSet", keyObject);
				this._bindView(sPath);
			}.bind(this));
			this.setModel(new JSONModel({
				busy: true
			}), "timelineview");
			this.getModel("timeline").setData({
				events: []
			});
		},

		_getKeyObjectFromRouting: function(navTarget, args) {
			var keyObject = {
				Bukrs: decodeURIComponent(args.companyCode),
				Recnnr: decodeURIComponent(args.contractId)
			};

			if (navTarget === "systemContract") {
				keyObject["SAP__Origin"] = args.systemId;
				this.systemId = args.systemId;
			} else {
				this.systemId = null;
			}

			return keyObject;
		},

		_bindView: function(path) {
			var dataModel = this.getModel();
			var viewModel = this.getModel("view");
			var that = this;
			this.getView().bindElement({
				path: path,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						dataModel.metadataLoaded().then(function() {
							viewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						that._initTimeline();
						viewModel.setProperty("/busy", false);
						var breakOptionBlock = that.getView().byId("breakOptionBlock");
						var breakOptionListButton = sap.ui.getCore().byId(breakOptionBlock.getSelectedView() + "--" +
							"breakOptionList-btnPersonalisation");
						breakOptionListButton.setType("Transparent");
						var renewalBlock = that.getView().byId("renewalBlock");
						var renewalListButton = sap.ui.getCore().byId(renewalBlock.getSelectedView() + "--" +
							"renewalList-btnPersonalisation");
						renewalListButton.setType("Transparent");
						var objectBlock = that.getView().byId("objectListBlock");
						var objectListButton = sap.ui.getCore().byId(objectBlock.getSelectedView() + "--" +
							"objectList-btnPersonalisation");
						objectListButton.setType("Transparent");
						var conditionBlock = that.getView().byId("conditionListBlock");
						var conditionListButton = sap.ui.getCore().byId(conditionBlock.getSelectedView() + "--" +
							"conditionList-btnPersonalisation");
						conditionListButton.setType("Transparent");
						var valuationBlock = that.getView().byId("valuationListBlock");
						var valuationListButton = sap.ui.getCore().byId(valuationBlock.getSelectedView() + "--" +
							"valuationList-btnPersonalisation");
						valuationListButton.setType("Transparent");
						var documentBlock = that.getView().byId("documentListBlock");
						var documentListButton = sap.ui.getCore().byId(documentBlock.getSelectedView() + "--" +
							"documentList-btnPersonalisation");
						documentListButton.setType("Transparent");

					}
				}
			});
			// if the binding is not changed we still need init the timeline.
			that._initTimeline();
		},
		_initTimeline: function() {
			var that = this;

			function todayPlusYears(years) {
				var now = new Date();
				return new Date(now.getFullYear() + years, now.getMonth(), now.getDate());
			}

			that.getModel().read(that.getView().getBindingContext().getPath() + '/Timeline', {
				filters: [
					new sap.ui.model.Filter({
						path: "Eventtype",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'C'
					})
				],
				success: function(result) {
					var i18n = that.getOwnerComponent().getModel('i18n').getResourceBundle();

					var currentTimeline = result.results[0];
					var type = currentTimeline.Eventtype;
					currentTimeline = {
						typeText: i18n.getText('Terms.Timeline.Event.Type.' + type),
						dateFrom: currentTimeline.Datefrom,
						dateTo: currentTimeline.Dateto,
						eventInfo: currentTimeline.Info,
						notifDateTo: currentTimeline.Notifdateto,
						type: type
					};
					that.getModel("currentTimeline").setData({
						currentTimeline: currentTimeline
					});
					var timelineblock = that.getView().byId("timelineBlock");
					sap.ui.getCore().byId(timelineblock.getSelectedView() + "--" + "timeline").onAfterRendering();
				}
			});


			that.getModel().read(that.getView().getBindingContext().getPath() + '/Timeline', {
				filters: [new sap.ui.model.Filter([
					new sap.ui.model.Filter({
						path: "Datefrom",
						operator: sap.ui.model.FilterOperator.GE,
						value1: todayPlusYears(-1)
					}),
					new sap.ui.model.Filter({
						path: "Datefrom",
						operator: sap.ui.model.FilterOperator.LE,
						value1: todayPlusYears(5)
					})
				], true)],
				success: function(result) {
					var i18n = that.getOwnerComponent().getModel('i18n').getResourceBundle();

					var events = result.results.map(function(event) {
						var type = event.Eventtype;
						return {
							typeText: i18n.getText('Terms.Timeline.Event.Type.' + type),
							dateFrom: event.Datefrom,
							dateTo: event.Dateto,
							eventInfo: event.Info,
							notifDateTo: event.Notifdateto,
							type: type
						};
					});
					that.getModel("timeline").setData({
						events: events
					});
					that.getModel("timelineRange").setData({
						from: todayPlusYears(-1),
						to: todayPlusYears(5)
					});
					that.getModel("timelineview").setProperty("/busy", false);
					var timelineblock = that.getView().byId("timelineBlock");
					sap.ui.getCore().byId(timelineblock.getSelectedView() + "--" + "timeline").onAfterRendering();
					that.getModel("timeline").setData({
						events: events
					});
				}
			});
		},

		_createBindingPath: function(entity, key, value) {
			return entity + "(" + key + "='" + value + "')";
		},

		_bindTermsSection: function() {
			var viewModel = this.getModel("view");
			var sView = this.getView();
			sView.byId("termBlock").bindElement({
				path: "Term",
				events: {
					dataRequested: function() {
						viewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						viewModel.setProperty("/busy", false);
					}
				}
			});

		},

		_onBindingChange: function() {
			var view = this.getView();
			var viewModel = this.getModel("view");
			var elementBinding = view.getElementBinding();

			// No data for the binding
			if (!elementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("contractNotFound");
				return;
			}

			this._updateWebGUIUrl(false);

			// Everything went fine.
			viewModel.setProperty("/busy", false);
		},

		_updateWebGUIUrl: function(openNow) {
			this.webGUIUrl = null;

			if (jumpOffWebGuiButtonActive) {
				var that = this;

				var path = this.getView().getBindingContext().getPath() + '/Transaction(';
				if (this.systemId) {
					path += 'SAP__Origin=\'' + this.systemId + '\',';
				}
				path += 'Tcode=\'RECN\')';
				this.getModel().read(path, {
					success: function(result) {
						if (result && result.Url && result.Ttext) {
							that.webGUIUrl = result.Url;

							var button = that.getView().byId("jumpOffWebGUI");
							button.setEnabled(true);
							button.setText(result.Ttext);

							if (openNow) {
								window.open(result.Url, "_blank");
							}
						}
					}
				});
			}
		},

		onReminderPopoverButtonPressed: function(oEvent) {
			if (!this._reminderPopover) {
				this._reminderPopover = sap.ui.xmlfragment('fin.re.conmgmts1.view.reminderblocks.ReminderPopover', this);
				this.getView().addDependent(this._reminderPopover);
			}
			this._reminderPopover.setPlacement(sap.m.PlacementType.Bottom);
			this._reminderPopover.openBy(oEvent.getSource());
		},

		onReminderPopoverClose: function() {
			if (this._reminderPopover) {
				this._reminderPopover.close();
			}
		},

		onJumpOffWebGUIPressed: function(oEvent) {
			if (this.webGUIUrl) {
				window.open(this.webGUIUrl, "_blank");
			} else {
				this._updateWebGUIUrl(true);
			}
		},

		onPartnerFilterSelection: function(oEvent) {
			var blocks = oEvent.getSource().getParent().getParent().getBlocks();
			var key = oEvent.getSource().getSelectedKey();
			var showAllPartners = key === "all";
			blocks[1].setVisible(!showAllPartners);
			blocks[2].setVisible(showAllPartners);

		},

		onTimelineFilterSelection: function(oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			var showAll = key === "all";
			var timelineblock = this.getView().byId("timelineBlock");
			var timeline = sap.ui.getCore().byId(timelineblock.getSelectedView() + "--" + "timeline");
			timeline.setNext(!showAll);
			timeline.onAfterRendering();
		}
	});
});
