$(function(){ // After the page load Run the javascript
  var chessCanvas = $('#chessboard')[0];
  var chessCtx = chessCanvas.getContext('2d');
  var colors = ['black', 'white', 'red'];
  var spaceSize = 63;

  //Color the board
  for(var i=0; i < 8; i++){
    for(var j=0; j < 8; j++){
      if((i % 2) != 0){
        if((j % 2) != 0){
          //Color white
        }
        else{
          //Color black
          chessCtx.fillStyle = colors[0];
          chessCtx.fillRect(i*64, j*64, 64, 64);
        }
      }
      else{
        if((j % 2) != 0){
          //Color black
          chessCtx.fillStyle = colors[0];
          chessCtx.fillRect(i*64, j*64, 64, 64);
        }
        else{
          //Color white
        }
      }
    }
  }  
}); // end of  document
