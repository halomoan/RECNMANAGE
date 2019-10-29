/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/UIComponent","sap/ui/Device","fin/re/conmgmts1/model/models","fin/re/conmgmts1/controller/ErrorHandler"],function($,U,D,m,E){"use strict";return U.extend("fin.re.conmgmts1.Component",{metadata:{manifest:"json"},init:function(){U.prototype.init.apply(this,arguments);this._oErrorHandler=new E(this);this.setModel(m.createDeviceModel(),"device");this.setModel(m.createFLPModel(),"FLP");this.getRouter().initialize();},destroy:function(){this._oErrorHandler.destroy();U.prototype.destroy.apply(this,arguments);},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if($(document.body).hasClass("sapUiSizeCozy")||$(document.body).hasClass("sapUiSizeCompact")){this._sContentDensityClass="";}else if(!D.support.touch){this._sContentDensityClass="sapUiSizeCompact";}else{this._sContentDensityClass="sapUiSizeCozy";}}return this._sContentDensityClass;}});});
