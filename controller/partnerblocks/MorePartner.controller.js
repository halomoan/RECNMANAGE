/*
 * Copyright (C) 2009-2017 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["fin/re/conmgmts1/controller/BaseController","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","fin/re/conmgmts1/model/formatter","fin/re/conmgmts1/util/SelectDataBindingHelper"],function(B,J,H,f,S){"use strict";return B.extend("fin.re.conmgmts1.controller.partnerblocks.MorePartner",{formatter:f,onInit:function(){},onAfterRendering:function(){this._bindMorePartnerSection();},_bindMorePartnerSection:function(){var v=this.getView();var p=v.byId("partnerListSlice");var a=v.byId("partnerList");S.initBlockWithTimeSlice(a,p,"Partner","PartnerSlice");}});});
