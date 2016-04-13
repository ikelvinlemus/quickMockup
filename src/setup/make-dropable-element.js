export default (element)=>{

    $(element).droppable({
    accept: ".mockElement, .newMockElement",
    tolerance: "fit",
    greedy: true, //you can only attach it to one element, otherwise every nested dropable recieves
    hoverClass: "drop-hover",
    drop: function( event, ui ) {
      //calculate offset of both
      var elementToAppend = null;

      if(ui.draggable.hasClass("newMockElement")){//if this is a new element
        elementToAppend = ui.draggable.clone(false);
        elementToAppend.removeClass("newMockElement");

        elementToAppend.addClass("mockElement");
        elementToAppend.css("position","absolute");//always has relative otherwise = glitches

        var idnr = parseInt(Math.random()*100000000000000); //not exactly a UUID but does the job for now.

        elementToAppend.attr("id","mockElement_"+idnr);
        //TODO: assign an id "editableArea"+idnr

        elementToAppend.find(".editableArea").first().attr("id","editableArea_"+idnr);

        setupElement(elementToAppend);
      }else{
        elementToAppend = ui.draggable;
      }

      var draggableOffset = ui.helper.offset(); //was ui.draggable
      var droppableOffset = $(this).offset();

      var newLeft =  draggableOffset.left - droppableOffset.left;
      var newTop = draggableOffset.top -  droppableOffset.top;

      elementToAppend.appendTo($(this)).css({top:newTop+"px", left:newLeft+"px"});
      }
    });//droppable End
  };//droppableWrapper End