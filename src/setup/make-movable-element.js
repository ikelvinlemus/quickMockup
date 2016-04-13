
export default (element)=>{

  //in case it already has the handle-elements (markup was duplicated or saved and now reloaded...)
  $(element).
        children(".ui-resizable-handle"). //find handles, which are direct decendants...
        remove(); //remove them (not useful when displaying)


  //now, make it draggable.
  $(element).draggable({
    distance: 4,
    disabled:false,
    revert:"invalid",
    zIndex: 999
  }).resizable({
    handles:"all"
  });
}
