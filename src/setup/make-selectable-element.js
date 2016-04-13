export default (element,selectorCanvasParam)=>{
    var $element = $(element);

    var selectorCanvas = selectorCanvasParam ? selectorCanvasParam : "body"; //if selectorCanvas is defined, set it to a standard value

    var selectedClassParam = "custom-selected";
    var elementSelector = ".mockElement";

    var $canvas = $(selectorCanvas);

    //deselect if canvas is clicked
    $canvas.click(function(event){
      if(event.target=== $canvas[0]){
        $canvas.find("." + selectedClassParam).removeClass(selectedClassParam);
      }
    });

    //select the this element, deselect others. This is inefficient when you apply the function in batch, but makes much sense, when initializing single elements (dragging them on canvas) without, a new element is deselected, and needs to be clicked again. Since the performance is o.k. for now, I leave it like it is.
    $canvas.find("." + selectedClassParam).removeClass(selectedClassParam);
    $element.addClass(selectedClassParam); /*custom selected, since there is a jQuery UI selected, that might be used later*/

    $element.mousedown(function(event){
      if($(event.target).closest(elementSelector)[0] === $element[0]){ //either it is the same element that was clicked, or the element is the clicked element’s the first parent that is a mock element.

        $canvas.find("." + selectedClassParam).removeClass(selectedClassParam);

        $element.addClass(selectedClassParam); /*custom selected, since there is a jQuery UI selected, that might be used later*/
      }
    });

  };