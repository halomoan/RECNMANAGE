/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["fin/re/conmgmts1/controller/BaseController"],function(B){'use strict';return B.extend('fin.re.conmgmts1.controller.conditionblocks.ConditionList',{onInit:function(){this._dialog=null;},onExit:function(){if(this._dialog){this._dialog.destroy();}},simulateCashFlow:function(){if(!this._dialog){this._dialog=sap.ui.xmlfragment('fin.re.conmgmts1.view.conditionblocks.CashFlowSimulation',this);this.getView().addDependent(this._dialog);}this._dialog.open();},close:function(){this._dialog.close();}});});
