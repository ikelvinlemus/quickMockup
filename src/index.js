import makeMovableElement from 'src/setup/make-movable-element'
import makeDropableElement from 'src/setup/make-dropable-element'
import makeSelectableElement from 'src/setup/make-selectable-element'

$(function(){
  var setupElements = function(){

    //setup canvas
    makeDropableElement("#canvas");
    //setup elements already on the page
    $(".mockElement").each(function(index, element){
      $(element).find(".ui-resizable-handle").remove();//otherwise we get them twice, they are saved with the file and created again when the element is initialized
      setupElement(element);
    });

    //make new sidebar elements draggabe
    $(".newMockElement").draggable({
      distance: 4,
      disabled:false,
      appendTo: "body",
      helper:"clone",
      revert:"invalid",
      zIndex:999
    });
  }

  var setupElement = function(element){
    makeMovableElement(element);
    makeDropableElement(element);
    $(element).editText();
    makeSelectableElement(element,"#canvas");
  };

  var duplicateElement=function(){
    var $canvas = $("body");
    var $element2BDuplicated = $canvas.find(".custom-selected");

    var clonedElement = $element2BDuplicated.clone(false); //clone all children too, don't clone events.


    //some elements have id
    var reassignID = function($element){
      var oldId = $element.attr("id")||"";
      var oldIdNr = oldId.match(/^mockElement_(\d+)/)[1]; //[1] to get the first capture group, , the id number.

      if(oldId.length >0){ //if it actually had an Id
        var newIdNr = parseInt(Math.random()*100000000000000);
        $element.attr("id", "mockElement_"+newIdNr);
        $element.find("#editableArea_"+oldIdNr).attr("id", "editableArea_"+newIdNr);
      }
    };

    clonedElement.find(".mockElement").each(function(index, element){
      reassignID($(element));
    });
    reassignID($(clonedElement));

    var originalElementPos = $element2BDuplicated.position();
    clonedElement.css({
      left:(originalElementPos.left+20)+"px",
      top:(originalElementPos.top+20)+"px"
    });
    clonedElement.removeClass("custom-selected");
    clonedElement.appendTo($element2BDuplicated.parent());

    clonedElement.find(".mockElement").each(function(index, element){
      setupElement(element);
    });
    setupElement(clonedElement);

  };

  var deleteElement=(function(){ //revealing module pattern
    var recentlyDeleted = { //hope saving these does not cause memory leaks. FUD.
      $element:null,
      $formerParent:null
    };
    var canvasSelector = "body";
    var element2BDeletedSelector = ".custom-selected";

    return{
      delete:function(){
        var $canvas = $(canvasSelector);
        var $element2BDeleted = $canvas.find(element2BDeletedSelector);

        recentlyDeleted.$formerParent = $element2BDeleted.parent(); //remember parent for re-attachment on redo
        recentlyDeleted.$element = $element2BDeleted.detach(); //delete element and store it  for re-attachment on redo
      },
      undelete:function(){

        if(!recentlyDeleted.$element || !recentlyDeleted.$formerParent ){
          return;
        }

        recentlyDeleted.$formerParent.append(recentlyDeleted.$element);
      }
    };
  }());


(function(){//setup the gui

    /*a dialog to change the canvas size. Maybe a bit over the top to use jqui for that.*/
    $("#changeCanvasSizeDialog").dialog({
      autoOpen:false,
      open: function( event, ui ) {
        var $container = $("#canvas");

        var currentHeight = $container.height();
        var currentWidth = $container.width();

        //show current dimensions in the input filds
        $(this).
          find('input[name="height"]').
          val(currentHeight);

        $(this).
          find('input[name="width"]').
          val(currentWidth);
      },
      buttons: [
        {
          text: "OK",
          click: function() {
          var $container = $("#canvas");

          $container.
            height(
              $(this).
              find('input[name="height"]')
              .val()
            );
          $container.
            width(
              $(this).
              find('input[name="width"]').
              val()
            );
          $(this).dialog( "close" );
          }
        },
        {
          text: "Cancel",
          click: function() {
            $(this).dialog( "close" );
          }
        }
      ]
    });

    //setup toolbar
    ///setup toolbar-delete button
    $("#toolbar .delete-element-button").click(deleteElement.delete); //delete button
    Mousetrap.bind(['del','backspace'],function(e){
      if (e.preventDefault) {
        e.preventDefault();
    }
      deleteElement.delete();
    }); //keyboard shortcut


    $("#toolbar .undelete-element-button").click(deleteElement.undelete);
    Mousetrap.bind(['ctrl+z','command+z'],deleteElement.undelete);

    $("#toolbar .duplicate-element-button").click(duplicateElement);
    Mousetrap.bind(['ctrl+d','command+d'],function(e){
      if (e.preventDefault) {
        e.preventDefault();
      }
      duplicateElement();
    });

    $("#toolbar .change-canvasize-button").click(function(){
      $("#changeCanvasSizeDialog").dialog("open");
    });

    $('#saveFile').click(function(){
      saveDocumentCode();
    })

    $('#loadFileButton').click(function(){
      $("#loadFile").click();
    })

    //setup sidebar resize
    $('#widgetCollectionWrap').resizable({
      handles: 'e',
      maxWidth:800,
    })




    // prevent navigating away by accident
    window.onbeforeunload = function(){
      return "do you want to close the application? Unsaved changes will be lost (use your browsers save function for saving)"
    };

    $('<button title="exports to codepen. »Save« on codepen to get a sharable URL">↗ to Codepen</button>').
      appendTo("#toolbar").
      click(function(){
        var htmlSource = $("#canvasWrap"),
          cssSource = $("#elementStyles");

        //if there is already a send-to-codepen-form, delete it
        $("form#sendToCodepen").remove();

        var htmlString = htmlSource.
          clone(). //for coming manipulations, so we don't actually change the original
          find(".ui-resizable-handle"). //find handles...
          remove(). //remove them (not useful when displaying)
          end(). //go out of the matched handles (via find) the the previous set (all in htmlSource)
          find("*").//every element
          each(function(index,element){
              var oldString = $(element).attr("data-editable-content") || "";

            //replace all ' and " by similar looking characters. //They can't be replaced by their actual html entities
            //since they have particular meaning (determine strings)
            //and thus mess up the syntax, since they would be replaced with the same chars like the characters that are actualy used to determine strings.
              $(element).attr(
                "data-editable-content",
                oldString.replace(/"/g, "&Prime;").replace(/'/g, "&prime;")
              );
            }).
            html();


        var cssString = cssSource
          .html();

        var data={
          html:htmlString,
          css:cssString,
          js:""
        };

        var jsonstring = JSON.stringify(data).replace(/"/g, "&quot;").replace(/'/g, "&apos;");

        var form =
      '<form id="sendToCodepen" action="http://codepen.io/pen/define" method="POST" target="_blank" style="display:none;">' +
        '<input type="hidden" name="data" value=\'' +
          jsonstring +
          '\'>' +
      '</form>';

        $(form).appendTo("body")
        $("#sendToCodepen").submit(); //$(form).submit fails in firefox

    });



  })();//setupgui end


  //loader functions
  var readStringToJquery =  function (string){
    var $importedHTML =  $(string);//that feels wired. I suppose I should at least sanitize scripts.

    var $sanitizedHTML = $importedHTML.remove("script"); //test if the scripts dont execute or if this is FUD

    return $sanitizedHTML;
  };

  function appendJqueryToQuickmockupDom(jqueryObject){
    //find container
    var $canvasWrap=$("#canvasWrap");
    var $widgetCollectionWrap=$("#widgetCollectionWrap");
    //empty container;
    $canvasWrap.empty();
    $widgetCollectionWrap.empty();
    //fill container
    $canvasWrap.append(jqueryObject.find("#canvasWrap").children());
    $widgetCollectionWrap.append(jqueryObject.find("#widgetCollectionWrap").children());
    //TODO: shall we do the init here as well? We could call the init functon from here
    return undefined;
    }


    $("#loadFile").fileReaderJS({//fixme: can we make this class as elementgetter?
      accept: 'text/*',
      readAsDefault: 'Text',
      on:{
        load:function(e,file){
          appendJqueryToQuickmockupDom(readStringToJquery(e.target.result)); //ugly!!!
          setupElements();
        }
      }
    });

    function saveDocumentCode(){
      var padNumberWith0es = function(number, padding){
        //number : the number you want to pad with 0es
        //padding: the length of the output string, 5 is 00000 and 00125 etc.

        if(padding+1< (""+number).length){ //make padding at last as long as the number, so nothing is cut off.
          padding = (""+number).length;
        }

        var zeroes = Array(padding+1).join("0");
        var paddedNumber = (zeroes + number).slice(-(zeroes.length));

        return paddedNumber;
      };

      var currentDate = new Date();

      var year  = currentDate.getFullYear();
      var month = currentDate.getMonth() + 1;
      var day   = currentDate.getDate();

      var documentstring = document.documentElement.outerHTML;
      var blob = new Blob([documentstring], {type: "text/plain;charset=utf-8"});
        saveAs(blob, ""+year+month+day+"mockup.html");
    }

  //START
  setupElements();
});
