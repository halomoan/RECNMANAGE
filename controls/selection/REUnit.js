sap.ui.define(
  ['sap/ui/core/Control'],
  function(Control) {
  return Control.extend("fin.re.conmgmts1.controls.selection.REUnit",{
       metadata: {
            properties: {},
            aggregations: {}
       },
       renderer: function(oRm,oControl){
            //to do: render the control
       },
       onAfterRendering: function() {
            //if I need to do any post render actions, it will happen here
            if(sap.ui.core.Control.prototype.onAfterRendering) {
                 sap.ui.core.Control.prototype.onAfterRendering.apply(this,arguments); //run the super class's method first
            }
       }
  });
  }
);