var legend_height;
var legend_width

document.getElementById('saveButton').addEventListener('click', function() 
        {      
       
var xml;    

const viewportWidth=900
const viewportHeight=600
const first_tab=5
const last_tab=20
var left_tab=5;

   
    //nodes            
var node = document.querySelector('#map_id svg');
            
            
   // var ctx_height=$('#total_chart').height();

   let title_height =  30;

let chart_height=document.getElementById('map_id').clientHeight;
let ctx_height =title_height+ chart_height+last_tab;
            
  ////          var ctx_height =1000
  console.log("legend height", legend_height, title_height)
  console.log("ctx_height", ctx_height,  chart_height)
                  
  xml = new XMLSerializer().serializeToString(node);  
    
  window['img'] = new Image;
  eval('img').src = 'data:image/svg+xml;base64,'+ btoa(xml);  
      
  eval('img').setAttribute('crossorigin', 'anonymous')
      
///img is map
            
    
        
  //Draw the full chart
   // create a new canvas

  elem0 = document.createElement('canvas');
            
elem0.height  = ctx_height;
elem0.width= document.getElementById('map_id').clientWidth
  ctx0 = elem0.getContext("2d");
   
 //   ctx0.translate(0, -100).scale(img_scale, img_scale)
            
// Draw the background
    
    
    ctx0.rect(0, 0, elem0.width, elem0.height);
    ctx0.fillStyle = "#9A8C98";
    ctx0.fill();
                        
    

      ////////////////////////////////////////////////////////text
      var title_text = `Global Trade, Year ${selected_year}`;
      ctx0.fillStyle = 'white'; // Background color
      ctx0.fillRect(0, 0, elem0.width, title_height); // Draw background rectangle. Here, 30 is approximately the height of the text. Adjust it as needed.
      ctx0.fillStyle = 'black'; // Text color     
    ctx0.font = "18px Arial";
    ctx0.textAlign = "center";
    var centerX = elem0.width / 2;
    ctx0.fillText(title_text,centerX, 25);
    
                
/////////////////////////////////////////////// Draw canvas
img.onload = function() {
    
/////////////////////////////////////////////// Draw legend
ctx0.fillStyle = '#F2E9E4'; // background color
ctx0.strokeStyle = '#22223b'; // border color
ctx0.lineWidth = 1; // border thickness

    /////////////////////////////////////////////////////////////Draw map
    ctx0.fillStyle = '#F2E9E4'; // path color
    ctx0.drawImage(img,left_tab,title_height)
        
    
//    Saving the file, or open the window with the image
       
     if (window.navigator.msSaveOrOpenBlob) { // for IE and Edge
       
      
             {
    var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png);base64,/, ""));
    var threshold=byteString.length
 //   var byteString = atob(elem0.toDataURL().replace(/^data:image\/(png|jpg);base64,/, ""));
	var ia = new Uint8Array(byteString.length);
    
         console.log("ia", byteString.length);
                 
             }
         
	for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
          
       
        var blob = new Blob([ia], { type: "image/png" });
      
       window.navigator.msSaveOrOpenBlob(blob, 'image.png')
         
         
   }
    else 
    { //for modern browsers
            
      //console.log(html); 
	  var link = document.createElement("a");
	  link.download = "image.png";
	  link.href = elem0.toDataURL("image/png");
	  
      link.click();
    }
       
        
         
        };
    
            
})
