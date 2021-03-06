/**
 * Name: joswei
 * File name: 2d.js
 * Description: Draws map and Sprite; controls gameplay.
 * 
 * Sources of Help: 
 * Draw a Gradient - https://developer.mozilla.org/en-US/docs/Web/API/
 *   CanvasRenderingContext2D/createLinearGradient
 * Basic HTML Game Tutorial - https://developer.mozilla.org/en-US/docs/
 *   Games/Tutorials/2D_Breakout_game_pure_JavaScript
 * Draw rounded rect on HTML5 Canvas - https://stackoverflow.com/questions/
 *   1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
 */

/* 
 * Context Object wraps everything nicely; includes func to initialize
 * canvas.
 */
var Context = {
  canvas: null,
  context: null,
  create: function(canvas_tag_id) {
    this.canvas = document.getElementById(canvas_tag_id);
    this.context = this.canvas.getContext("2d");
    return this.context;
  }
};

var Sprite = function(filename, is_pattern) {

  /* Construct object */
  this.image = null;
  this.pattern = null;
  this.TO_RADIANS = Math.PI/180;

  /* Check to make sure filename is valid */
  if (filename != undefined && filename != "" && fileanme != null) {
    this.image = new Image();
    this.image.src = filename;

    if (is_pattern) {
      this.pattern = Context.context.createPattern(this.image, 'repeat');
    }
  } else {
    console.log("Unable to load sprite.");
  }

  this.draw = function(x, y, w, h) {
    /* Is this a pattern? */
    if (this.pattern != null) {
      Context.context.fillStyle = this.pattern;
      Context.context.fillRect(x, y, w, h);
    } else {
      /* Not a Pattern; is an Image */
      /* Did we specify width/height? */
      if (w != undefined || h != undefined) {
        Context.context.drawImage(this.image, x, y,
            this.image.width, this.image.height);
      } else {
        /* Stretched image */
        Context.context.drawImage(this.image, x, y, w, h);
      }
    }
  };

};

// Main functionality here
$(document).ready(function() {

    /* "canvas" string - we get Element by ID from the html file */
    Context.create("canvas"); 

    /* Draws background */
    function drawBackground() {
      /* Draw dark blue gradient background */
      var gradient = Context.context.createLinearGradient(0, 0, 300, 0);
      gradient.addColorStop(0, "#19198c");
      gradient.addColorStop(1, "#00004c");
      //gradient.addColorStop(0, "black");
      //gradient.addColorStop(1, "white");
      Context.context.beginPath();
      Context.context.fillStyle = gradient;
      Context.context.fillRect(0, 0, 750, 600);
      Context.context.closePath();
    }

    /* Rotate right function */
    function rotateRight(image) {
      element.className = "rotateRight";
    }

    /* Rotate left function */
    function rotateLeft(image) {
      element.className = "rotateLeft";
    }

    /* Return to normal function */
    function rotateNone(image) {
      element.className = "rotateNone";
    }

    /* Rotate to face downwards */
    function rotateDown(image) {
      element.className = "rotateDown";
    }

    /* Penguin's starting position */
    var xPadding = 40;
    var yPadding = 240;
    var xPos = canvas.width / 2 - xPadding;
    var yPos = canvas.height / 2 + yPadding;

    /* Bools to check if left/right/spacebar are pressed */
    var rightPressed = false;
    var leftPressed = false;
    /* Is the game paused? */
    var paused = false;

    /* Padding for text */
    var horizPadding = 10;
    var vertPadding = 30;
    
    /* Keeps track of score */
    var score = 0;
    var scoreXPos = 8;
    var scoreYPos = 20;

    /* Time elapsed */
    var timeElapsed = 0;
    var timeXPos = canvas.width - 200;
    var timeYPos = 20;

    /* Variables for ice */
    var iceWidth = 100;
    var iceHeight = 100;
    var iceXPos = 30;
    var iceYPos = 30;
    var startX = 3;
    var startY = 5;
    /* Constants for type of ice or water */
    var WATER = 0;
    var BARE_ICE = 1;
    var SNOW_ICE = 2;
    var DIRTY_ICE = 3;
    /* Number of rows and columns */
    var rows = 7;
    var cols = 7;

    /* Penguin dimensions */
    var penguinWidth = 90;
    var penguinHeight = 90;

    /* Directional arrowkey codes for KeyDown or KeyUp detection */
    var DOWN = 40;
    var RIGHT = 39;
    var UP = 38;
    var LEFT = 37;
    var SPACEBAR = 32;

    /* Healthbar */
    var HEALTH_START = 128;
    var health = HEALTH_START;
    var healthIncrement = 16;
    var HEALTH_BAR_HEIGHT = 10;
    var RADIUS = 5;
    var healthXPos = canvas.width - 150;
    var healthYPos = 10;

    /* Ice */ 
    var ice = [];
    for (i = 0; i < cols; i++) {
      ice[i] = [];
      for (j = 0; j < rows; j++) {
        var randomNum = Math.random();
        var iceType = 0;
        /* At start, 0.1 chance of water appearing; increases with time */
        var firstCutoff = 0.1;
        /* Highest probability of bare ice appearing */
        var secondCutoff = 0.65;
        /* At start, 0.2 chance of snow ice */
        var thirdCutoff = 0.85;
        /* At start, 0.15 chance of dirty ice */
        if (randomNum <= firstCutoff) {
          iceType = WATER;
        } else if (randomNum > firstCutoff && randomNum <= secondCutoff) {
          iceType = BARE_ICE;
        } else if (randomNum > secondCutoff && randomNum <= thirdCutoff) {
          iceType = SNOW_ICE;
        } else {
          iceType = DIRTY_ICE;
        }
        ice[i][j] = {x: 0, y: 0, type: iceType};
      }
    }
    ice[startX][startY] = {x: 0, y: 0, type: BARE_ICE};
        
    /* Create images for clean ice, dirty ice, and snow-covered ice */
    var cleanIceImg = new Image(iceWidth, iceHeight); 
    cleanIceImg.src = "assets/cleanIce.png";
    var dirtyIceImg = new Image(iceWidth, iceHeight); 
    dirtyIceImg.src = "assets/dirtyIce.png";
    var snowIceImg = new Image(iceWidth, iceHeight);
    snowIceImg.src = "assets/snowIce.png";

    /* Function draws map on screen */
    function drawIce() {

      /* Based on randomly generated 2d array, draw map */
      for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {

          /* Water, bare ice, snow-covered, or dirty ice */
          if (ice[i][j].type == WATER) {
            /* Draw nothing if this block is water */
            continue;
          } else if (ice[i][j].type == BARE_ICE) {
            /* Draw bare ice at correct (x, y) position on canvas */
            Context.context.drawImage(cleanIceImg, iceXPos + (i * iceWidth), 
                iceYPos + (j * iceHeight), iceWidth, iceHeight);
          } else if (ice[i][j].type == SNOW_ICE) {
            /* Draw snow-covered ice at correct (x, y) position on canvas */
            Context.context.drawImage(snowIceImg, iceXPos + (i * iceWidth), 
                iceYPos + (j * iceHeight), iceWidth, iceHeight);
          } else {
            /* Draw dirty ice at correct (x, y) position on canvas */
            Context.context.drawImage(dirtyIceImg, iceXPos + (i * iceWidth), 
                iceYPos + (j * iceHeight), iceWidth, iceHeight);
          }

        }
      }

    }

    // loops
    function draw() {
      if (paused) {
        drawPause();
        return;
      }
      drawBackground();

      drawIce();

      var penguinImg = new Image(penguinWidth, penguinHeight); 
      penguinImg.src = "assets/penguin.png";
      Context.context.drawImage(penguinImg, xPos, yPos, penguinWidth,
          penguinHeight);

      drawScore();
      drawHealth();
      //drawTimeElapsed();
      //collisionDetection();
      
    }

    //document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    
    // TODO Do you even need a keyDownHandler at the moment?
/*
    function keyDownHandler(e) {
      if (e.keyCode == '39') {
        rightPressed = true;
      } else if (e.keyCode == '37') {
        leftPressed = true;
      }
    }
*/
    function keyUpHandler(e) {
      if (e.keyCode == DOWN) {
        yPos += iceHeight;
      } else if (e.keyCode == RIGHT) {
        xPos += iceWidth;
      } else if (e.keyCode == UP) {
        yPos -= iceHeight;
      } else if (e.keyCode == LEFT) {
        xPos -= iceWidth;
      } else if (e.keyCode == SPACEBAR) {
        paused = !paused;
      }
      collisionDetection();
    }

    /*
     * Draw Paused Message
     */
    function drawPause() {
      Context.context.font = "30px Arial";
      Context.context.fillStyle = "#FF0000";
      Context.context.fillText("GAME PAUSED", 
          canvas.width / 3, canvas.height / 4);
      Context.context.font = "16px Arial";
      Context.context.fillText("Press Spacebar to Resume",
          canvas.width / 3 + horizPadding, canvas.height / 4 + vertPadding);
    }

    /* Function for collision detection that will loop through ice blocks and
     * compare each block's position with penguin position; if collided, ice
     * block's type will change
     */
    function collisionDetection() {

      /* Calculate which block of ice the penguin is currently sitting on */
      var i = Math.floor(xPos / iceWidth);
      var j = Math.floor(yPos / iceHeight);
      /* What type of ice is this block? */
      var TYPE = ice[i][j].type;

      if (TYPE == SNOW_ICE) {
      /* If penguin collides w/ SNOW_ICE, change type to BARE_ICE */
        ice[i][j].type = BARE_ICE;
        Context.context.drawImage(cleanIceImg, iceXPos + (i * iceWidth), 
            iceYPos + (j * iceHeight), iceWidth, iceHeight);
      } else if (TYPE == DIRTY_ICE) {
      /* If penguin collides w/ DIRTY_ICE, change type to BARE_ICE and
       * decrease health */
        ice[i][j].type = BARE_ICE;
        Context.context.drawImage(cleanIceImg, iceXPos + (i * iceWidth), 
            iceYPos + (j * iceHeight), iceWidth, iceHeight);
        health -= healthIncrement;
        if (health == 0) {
          setTimeout(function() {
            alert("GAME OVER");
            document.location.reload();
          }, 50);
        }
      } else if (TYPE == WATER) {
      /* If penguin collides with WATER, game over */
        setTimeout(function() {
          alert("GAME OVER");
          document.location.reload();
        }, 50);
      } else if (TYPE == BARE_ICE) {
      /* If penguin collides with BARE_ICE, change type to WATER */
        // TODO Currently, draw() loops too fast - all blocks will turn to water
        // because they turn first to bare ice and then to water
        
        // Commented out this line until this bug is fixed
        //ice[i][j].type = WATER;
      }
    }

    // Function to keep track of time elapsed
    function drawTimeElapsed() {
      Context.context.font = "16px Arial";
      /* Red text */
      Context.context.fillStyle = "#FF0000";
      Context.context.fillText("Time Elapsed: " + timeElapsed,
          timeXPos, timeYPos);
    }

    // Function to create and update score display
    function drawScore() {
      Context.context.font = "16px Arial";
      /* Red text */
      Context.context.fillStyle = "#FF0000";
      Context.context.fillText("Score: " + score, scoreXPos, scoreYPos);
    }

    // Function to create and draw healthbar
    function drawHealth() {
      Context.context.beginPath();

      /* Bar underneath is white */
      Context.context.fillStyle = "#ffffff";
      roundRect(Context.context, healthXPos, healthYPos,
          HEALTH_START, HEALTH_BAR_HEIGHT, RADIUS, false);
      Context.context.fill();
      Context.context.closePath();

      /* Red text and health bar */
      Context.context.beginPath();
      Context.context.fillStyle = "#FF0000";
      roundRect(Context.context, healthXPos, healthYPos,
          health, HEALTH_BAR_HEIGHT, RADIUS, true, false);
      Context.context.fill();

      Context.context.font = "16px Arial";
      Context.context.fillText("Health", healthXPos - 50, scoreYPos);
      Context.context.closePath();
    }

    /**
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle
     * outline with a 5 pixel border radius
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 5] The corner radius; It can also be an object 
     *                 to specify different radii for corners
     * @param {Number} [radius.tl = 0] Top left
     * @param {Number} [radius.tr = 0] Top right
     * @param {Number} [radius.br = 0] Bottom right
     * @param {Number} [radius.bl = 0] Bottom left
     * @param {Boolean} [fill = false] Whether to fill the rectangle.
     * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
     */
    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
      if (typeof stroke == 'undefined') {
        stroke = true;
      }
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
      } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side];
        }
      }
      ctx.beginPath();
      ctx.moveTo(x + radius.tl, y);
      ctx.lineTo(x + width - radius.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      ctx.lineTo(x + width, y + height - radius.br);
      ctx.quadraticCurveTo(x + width, y + height, 
          x + width - radius.br, y + height);
      ctx.lineTo(x + radius.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      ctx.lineTo(x, y + radius.tl);
      ctx.quadraticCurveTo(x, y, x + radius.tl, y);
      ctx.closePath();
      if (fill) {
        ctx.fill();
      }
      if (stroke) {
        ctx.stroke();
      }

    }

    /* Tells the draw() function to repeat */
    setInterval(draw, 10);

});
