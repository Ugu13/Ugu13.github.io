class InsertionLinked extends Phaser.Scene {

    constructor() {
        super({ key:'InsertionLinked' });
    }

    preload() {
        this.load.spritesheet('onion', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {

        // *************VARIABLES*************
        // Used to offset y of player so that it does not fall off the node during setPosition
        const BUFFER = 60;
        // Used for intializing overlap of node with node, to be able to redraw the tree only when it expands
        var nodearray = [];
        // Global tree depth is stored here
        var treeDepth = 0;
        // A constant used for calculating distances between nodes
        const w = 80;

        // *************SCENE SPECIFIC CODE*************
        // Text on top of the game world
        this.add.text(2000,100, 'Level 2: Insert', { fontSize: '30px', fill: '#000' });
        //Instructions
        this.add.text(2700,100, 'Instructions:\nPress ENTER to insert while standing on null node\nPress left arrow to move to the left child\nPress right arrow to move to the right child\nPress up arrow to move to the parent\nPress Z to zoom in and zoom out', { fontSize: '20px', fill: '#000' });
        // Switches from this scene to InsertionLinked
        var spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spacebar.on('down', () => {
            this.scene.stop('InsertionLinked');
            this.scene.start('DeleteLinked');
        });

        // *************PLAYER*************
        var player = this.physics.add.sprite(2500, 300, 'onion');
        player.setBounce(0.1);

        var cursors = this.input.keyboard.createCursorKeys();

        // *************CAMERA AND ZOOM*************
        this.cameras.main.setBounds(0, 0, 5000, 5000);
        // this.cameras.main.startFollow(player, true, 0.08, 0.08);
        this.cameras.main.centerOn(2500,500);
        this.cameras.main.zoom = 1;
        this.cameras.main.startFollow(player, true, 0.05, 0.05);

        var isZoomed = true;
        var keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        keyZ.on('down', function () {
            var cam = this.cameras.main;
            if(isZoomed) {  // zoom out
                cam.stopFollow();
                cam.pan(root.x, root.y, 2000, 'Power2'); //x to pan to, y to pan to, pan speed?, pan mode
                cam.zoomTo(0.5, 1000);//zoom distance, duration/speed of zoom
                isZoomed = false;
            } else { // zoom in
                cam.startFollow(player, true, 0.05, 0.05);
                // cam.pan(player.x, player.y, 2000, 'Power2'); //x to pan to, y to pan to, pan speed?, pan mode
                cam.zoomTo(1, 1000);//zoom distance, duration/speed of zoom
                isZoomed = true;
            }
        }, this);

        // this.cameras.world.setBounds(0, 0, 600, 2000);
        // player.setCollideWorldBounds(true);

        // *************INITIALIZE BST*************
        // Array of nodes to be inserted into BST automatically by insertNodes
        var numsToInsert = [33,1,14,5,17,16,55,50,70,48,53,60,80];
        //var numsToInsert = [28,13,77,7,21,50,100,18];
        // var numsToInsert = [33,11,44,10,12,55,5,13,50,70,3,8,17,48,53,60,80,4];
        // var numsToInsert = ["S","E","X","A","R","C","H","M"]
        
        // BST (intially an empty/null root node)
        var root = createRoot(this);
        // Inserts the elements from the array above (numsToInsert)
        createTree(this);
        
        function createRoot(scene) {
            var root = new BSTNode(scene, 2500, 300, 'null', makeNodeGraphics('null',scene));
            root.depth = 0;
            root.setSize(55,55);
            scene.physics.add.existing(root, 1);
            // for the curtain:
            scene.physics.add.overlap(player, root, revealValue, null, scene);
            scene.physics.add.collider(player, root);
            return root;
        }

        function createTree(scene) {
            // for each element in array numsToInsert
            //      insert that item to the tree
            numsToInsert.forEach(key => {
                insertNodes(root, key, scene);
            });
            redraw(root, scene);
        }

        // Insertion - automatic
        function insertNodes(node, key, scene) {

            if (node.key == 'null') {
                var x = node.x;
                var y = node.y;
                var depth = node.depth;
                var parent = node.parent;
                var q = node.distanceFromParent;
                
                var newNode = new BSTNode(scene, x, y, key, makeNodeGraphics(key,scene));
                newNode.depth = depth;
                newNode.parent = parent;
                newNode.setSize(55,55);
                newNode.drawLinkToParent(scene);
                scene.physics.add.existing(newNode, 1);
                nodearray.push(newNode);
                newNode.distanceFromParent = q;

                // if the depth that the current node is at is 0, then it means
                // a new root is being created here so we need to update the global root.
                if (depth == 0) {
                    root = newNode;
                } else if (parent.left == node) {
                    parent.left = newNode;
                } else if (parent.right == node) {
                    parent.right = newNode;
                }

                if (node.link != null) {
                    node.link.destroy();
                }
                node.destroy();

                var childL = new BSTNode(scene, x-w, y+w, 'null',makeNodeGraphics('null',scene)); //y+w
                childL.parent = newNode;
                childL.depth = depth+1;
                childL.setSize(55,55);
                scene.physics.add.existing(childL, 1);
                newNode.left = childL;
                childL.drawLinkToParent(scene);
                nodearray.push(childL);
                childL.distanceFromParent = -w;

                var childR = new BSTNode(scene, x+w, y+w, 'null',makeNodeGraphics('null',scene));
                childR.parent = newNode;
                childR.depth = depth+1;
                childR.setSize(55,55);
                scene.physics.add.existing(childR, 1);
                newNode.right = childR;
                childR.drawLinkToParent(scene);
                nodearray.push(childR);
                childR.distanceFromParent = w;

                // teleporting
                scene.physics.add.overlap(player, newNode, teleportLeft, cursorLeftIsPressed, scene);
                scene.physics.add.overlap(player, newNode, teleportRight, cursorRightIsPressed, scene);
                scene.physics.add.overlap(player, newNode, teleportUp, cursorUpIsPressed, scene);

                scene.physics.add.overlap(player, childL, teleportUp, cursorUpIsPressed, scene);
                scene.physics.add.overlap(player, childR, teleportUp, cursorUpIsPressed, scene);

                // redraw
                scene.physics.add.collider(newNode, nodearray, redrawTree, null, scene);
                scene.physics.add.collider(childL, nodearray, redrawTree, null, scene);
                scene.physics.add.collider(childR, nodearray, redrawTree, null, scene);

                // insert
                scene.physics.add.overlap(player, newNode, insert, enterIsPressed, scene);
                scene.physics.add.overlap(player, childL, insert, enterIsPressed, scene);
                scene.physics.add.overlap(player, childR, insert, enterIsPressed, scene);

                // curtain reveal
                scene.physics.add.overlap(player, newNode, revealValue, null, scene);
                scene.physics.add.overlap(player, childL, revealValue, null, scene);
                scene.physics.add.overlap(player, childR, revealValue, null, scene);

                // standing on nodes
                scene.physics.add.collider(player, newNode);
                scene.physics.add.collider(player, childL);
                scene.physics.add.collider(player, childR);

                player.setPosition(root.x,root.y-BUFFER);
                
                if (childL.depth > treeDepth) {
                    treeDepth = childL.depth;
                }

                updateDistances(newNode, childR.x);

            } else if (node.key > key) {
                if (node.left != null) { //  we might not need this if statement check cause we dont have a node.left that is null
                    insertNodes(node.left, key, scene);
                }
            } else if (node.key < key) {
                if (node.right != null) {
                    insertNodes(node.right, key, scene);
                }
            }
        }

        //***************INSERTION***************

        // elements to insert
        var tasks = [3,77];
        // displays what operations needs to be performed by the player
        var taskText = displayText(this);
        // for displaying feedback after completing tasks
        var feedback = this.add.text(2000,150, '', { fontSize: '20px', fill: '#000' });;

        var enterAllowed = false;
        var keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        function enterIsPressed() {
            var moveAllowed = false;
            if(keyEnter.isDown){
                enterAllowed = true;
            }
            if (enterAllowed && keyEnter.isUp) {
                moveAllowed = true;
                enterAllowed = false;
            }
            return moveAllowed;
        }

        function insert(player,node) {

            if (checkInsertion(root, node)) {
                if(node.key == 'null') {
                    var x = node.x;
                    var y = node.y;
                    var depth = node.depth;
                    var parent = node.parent;
                    var q = node.distanceFromParent;
                    
                    var newNode = new BSTNode(this, x, y, tasks[0], makeNodeGraphics(tasks[0],this));
                    tasks.shift();
                    newNode.depth = depth;
                    newNode.parent = parent;
                    newNode.setSize(55,55);
                    newNode.drawLinkToParent(this);
                    this.physics.add.existing(newNode, 1);
                    nodearray.push(newNode);
                    newNode.distanceFromParent = q;
                    if(newNode.getByName('curtain')){
                        newNode.getByName('curtain').destroy();
                    }

                    // if the depth that the current node is at is 0, then it means
                    // a new root is being created here so we need to update the global root.
                    if (depth == 0) {
                        root = newNode;
                    } else if (parent.left == node) {
                        parent.left = newNode;
                    } else if (parent.right == node) {
                        parent.right = newNode;
                    }
                    // ^  if parent's left link node is the same object as current node then we need to
                    // update left link of parent.
                    // otwrwise if parent's right link node is the same object as current node then
                    // we need to update the right link of parent

                    if (node.link != null) {
                        node.link.destroy();
                    }
                    node.destroy();

                    var childL = new BSTNode(this, x-w, y+w, 'null', makeNodeGraphics('null',this)); //y+w
                    childL.parent = newNode;
                    childL.depth = depth+1;
                    childL.setSize(55,55);
                    this.physics.add.existing(childL, 1);
                    newNode.left = childL;
                    childL.drawLinkToParent(this);
                    nodearray.push(childL);
                    childL.distanceFromParent = -w;

                    var childR = new BSTNode(this, x+w, y+w, 'null', makeNodeGraphics('null',this));
                    childR.parent = newNode;
                    childR.depth = depth+1;
                    childR.setSize(55,55);
                    this.physics.add.existing(childR, 1);
                    newNode.right = childR;
                    childR.drawLinkToParent(this);
                    nodearray.push(childR);
                    childR.distanceFromParent = w;

                    // teleporting
                    this.physics.add.overlap(player, newNode, teleportLeft, cursorLeftIsPressed, this);
                    this.physics.add.overlap(player, newNode, teleportRight, cursorRightIsPressed, this);
                    this.physics.add.overlap(player, newNode, teleportUp, cursorUpIsPressed, this);
                    
                    this.physics.add.overlap(player, childL, teleportUp, cursorUpIsPressed, this);
                    this.physics.add.overlap(player, childR, teleportUp, cursorUpIsPressed, this);

                    // insert
                    this.physics.add.overlap(player, childL, insert, enterIsPressed, this);
                    this.physics.add.overlap(player, childR, insert, enterIsPressed, this);

                    // redraw
                    this.physics.add.collider(newNode, nodearray, redrawTree, null, this);
                    this.physics.add.collider(childL, nodearray, redrawTree, null, this);
                    this.physics.add.collider(childR, nodearray, redrawTree, null, this);

                    // curtain
                    this.physics.add.collider(player, newNode, revealValue, null, this);
                    this.physics.add.collider(player, childL, revealValue, null, this);
                    this.physics.add.collider(player, childR, revealValue, null, this);

                    // player standing on nodes
                    this.physics.add.collider(player, newNode);
                    this.physics.add.collider(player, childL);
                    this.physics.add.collider(player, childR);

                    player.setPosition(root.x,root.y-BUFFER);

                    if (childL.depth > treeDepth) {
                        treeDepth = childL.depth;
                    }
                }
                feedback.destroy();
                feedback = this.add.text(2000,150, 'Good job!!!', { fontSize: '20px', fill: '#000' });
                taskText.destroy();
                taskText = displayText(this);
                // redraw(root, this);
            } else {
                feedback.destroy();
                feedback = this.add.text(2000,150, 'Try again', { fontSize: '20px', fill: '#000' });
                player.setPosition(root.x,root.y-BUFFER);
                redraw(root, this);
            }
        }

        function checkInsertion(node,nodeThatPlayerStandsOn) {
            var insertionAllowed = false;
            if (node.key == 'null') {
                if (node == nodeThatPlayerStandsOn) {
                    insertionAllowed = true;
                }
            } else if (node.key > tasks[0]) {
                insertionAllowed = checkInsertion(node.left,nodeThatPlayerStandsOn);
            } else if (node.key < tasks[0]) {
                insertionAllowed = checkInsertion(node.right,nodeThatPlayerStandsOn);
            }
            return insertionAllowed;
        }

        //while there are still some tasks in the array, displays text indicating what needs to be done
        //when tasks is empty then press P to continue to next lesson
        function displayText(scene) {
            if (tasks.length != 0) { 
                return scene.add.text(2000,175, 'Insert ' + tasks[0], { fontSize: '22px', fill: '#000' });
            } else {
                return scene.add.text(1900,800, 'Press SPACEBAR to learn new operation', { fontSize: '60px', fill: '#0356f0' });
            }
        }
       

        // ***************CURSOR KEYS ACTIONS + CURTAIN***************

        // Left cursor logic on overlap with player:
        // this.physics.add.overlap(player, root, teleportLeft, cursorLeftIsPressed, this);

        var leftAllowed = false;
        function cursorLeftIsPressed() {
            var moveAllowed = false;
            if(cursors.left.isDown){
                leftAllowed = true;
            }
            if (leftAllowed && cursors.left.isUp) {
                moveAllowed = true;
                leftAllowed = false;
            }
            return moveAllowed;
        }

        function teleportLeft(player, node) {
            if (node.left != null) {
                player.setPosition(node.left.x,node.left.y-BUFFER);
            }
        }

        // Right cursor logic on overlap with player:
        // this.physics.add.overlap(player, root, teleportRight, cursorRightIsPressed, this);

        var rightAllowed = false;
        function cursorRightIsPressed() {
            var moveAllowed = false;
            if(cursors.right.isDown){
                rightAllowed = true;
            }
            if (rightAllowed && cursors.right.isUp) {
                moveAllowed = true;
                rightAllowed = false;
            }
            return moveAllowed;
        }

        
        function teleportRight(player, node) {
            if (node.right != null) {
                player.setPosition(node.right.x,node.right.y-BUFFER);
            }
        }

        // Up cursor logic on overlap with player:
        // this.physics.add.overlap(player, root, teleportUp, cursorUpIsPressed, this);

        var upAllowed = false;
        function cursorUpIsPressed() {
            var moveAllowed = false;
            if(cursors.up.isDown){
                upAllowed = true;
            }
            if (upAllowed && cursors.up.isUp) {
                moveAllowed = true;
                upAllowed = false;
            }
            return moveAllowed;
        }

        function teleportUp(player, node) {
            if (node.parent != null) {
                player.setPosition(node.parent.x,node.parent.y-BUFFER);
            }
        }

        // For the curtain on overlap/collide
        function revealValue(player, node) {
            if(node.getByName('curtain')){
                node.getByName('curtain').destroy();
            }
        }

        // ***************REDRAW TREE CODE***************

        function redrawTree(node,nodeThatIsInTheWay) {
            console.log("COLLISION");
            updateDistances(node.parent, node.x);
            redraw(root, this);
        }

        function updateDistances(node,xToCheck) {
            if(node.parent != null) {
                if ((node.parent.left.key == 'null' && node.parent.right.key != null && node.parent.right.key != 'null') || (node.parent.right.key == 'null' && node.parent.left.key != null && node.parent.left.key != 'null')) {
                    node.parent.left.distanceFromParent = node.left.distanceFromParent;
                    node.parent.right.distanceFromParent = node.right.distanceFromParent;
                } else if (node.parent.left.key != 'null' && node.parent.right.key != 'null' && node.parent.left.key != null && node.parent.right.key != null) {
                    if ((Math.max(node.parent.right.distanceFromParent*2, Math.abs(node.parent.left.distanceFromParent*2)) <= node.right.distanceFromParent*2) || (node.parent.x == xToCheck) ) {
                        node.parent.left.distanceFromParent = node.parent.left.distanceFromParent*2;
                        node.parent.right.distanceFromParent = node.parent.right.distanceFromParent*2;
                    }
                }
                updateDistances(node.parent,xToCheck);        
            }
        }

        function redraw(node, scene) {
            if (node != null) {
                var q = node.distanceFromParent;
                var x = node.x;
                var y = node.y;
                var key = node.key;
                var left = node.left;
                var right = node.right;
                var parent = node.parent;
                var depth = node.depth;

                var newNode;

                if (depth > 0) {
                    newNode = new BSTNode(scene, parent.x+q, parent.y+w, key, makeNodeGraphics(key,scene));
                } else {
                    newNode = new BSTNode(scene, x, y, key, makeNodeGraphics(key,scene));
                }
                
                if (left != null) {
                    left.parent = newNode;
                }

                if (right != null) {
                    right.parent = newNode;
                }

                newNode.depth = depth;
                newNode.parent = parent;
                newNode.left = left;
                newNode.right = right;
                newNode.distanceFromParent = q;
                newNode.setSize(55,55);
                scene.physics.add.existing(newNode, 1);

                if (depth == 0) {
                    root = newNode;
                } else if (parent.left == node) {
                    parent.left = newNode;
                } else if (parent.right == node) {
                    parent.right = newNode;
                }

                if (node.link != null) {
                    node.link.destroy();
                }
                node.destroy();

                newNode.drawLinkToParent(scene);

                if (key != 'null') {
                    scene.physics.add.overlap(player, newNode, teleportLeft, cursorLeftIsPressed, scene);
                    scene.physics.add.overlap(player, newNode, teleportRight, cursorRightIsPressed, scene);
                    scene.physics.add.overlap(player, newNode, revealValue, null, scene);
                }
                scene.physics.add.overlap(player, newNode, teleportUp, cursorUpIsPressed, scene);
                scene.physics.add.overlap(player, newNode, insert, enterIsPressed, scene);
                scene.physics.add.collider(player, newNode);

                scene.physics.add.collider(newNode, nodearray, redrawTree, null, scene);

                redraw(newNode.left,scene);
                redraw(newNode.right,scene);
            }
        }

        // ***************HELPERS***************

        // calculates the the depth of the tree
        // here we give the root node as a parameter
        function height(node) {
            if (node.key === "null") return 0
            else {
                var left = height(node.left)
                var right =  height(node.right)
                return  Math.max(left, right) + 1
            }  
        }

        // traverses BST recursively, starting from root and prints all keys
        // call should look like this: traverseBST(root,0);
        // I think it's Pre-Order?
        function traverseBST(node, index) {
            if (node != null) {
                traverseBST(node.left, (2*index)+1);
                traverseBST(node.right, (2*index)+2);
            }
        }

        // Returns an array with graphics for the node, used when creating new BSTNode (TODO: Move links here too)
        function makeNodeGraphics(key,scene) {
            var array = [];
            var curtain = scene.add.rectangle(0, 0, 55, 55, 0xe92a7a);
            curtain.setName('curtain');
            var shape = scene.add.rectangle(0, 0, 55, 55, 0x35d330);
            shape.setName('shape');
            if (key == 'null') { //if key is null then the node colour is gray
                shape.setFillStyle(0xb0b3b0, 1);
            }
            var keyString = scene.add.text(0,0, '' + key, { fontSize: '20px', fill: '#000' });
            keyString.setName('keyString');
            Phaser.Display.Align.In.Center(keyString, shape);
            array.push(shape);
            array.push(keyString);
            if(key != 'null'){
                array.push(curtain);
            }
            return array;
        }
    }

    update() {

    }
}

class BSTNode extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, key, children)
    {
        super(scene, x, y, children);
        this.scene = scene;

        this.key = key;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.depth = null;
        this.x = x;
        this.y = y;
        this.distanceFromParent = null;
        this.isRed = false;
       
        // TODO: non-destructive approach: maybe make it somehow that we update the value of the existing nodes when inserting and not destroy it.
        // maybe there is a method to change the position of the container so that we could change its position on expansion.
        // container.setPosition moves the children and not the container itself...

        // move link to children and use order of children in container to move the link graphics below node graphics?
        // container.sendToBack(child)
        this.link = null;
        scene.add.existing(this);
    }

    drawLinkToParent(scene) {
        if (this.parent != null) {
            var line1 = new Phaser.Geom.Line(this.x, this.y, this.parent.x, this.parent.y);
            this.link = scene.add.graphics({ lineStyle: { width: 2, color: 0xaa00aa } });
            this.link.strokeLineShape(line1);
        }
    }

    drawLinkToParentRB(scene) {
        if (this.parent != null) {
            if (this.isRed) {
                var line1 = new Phaser.Geom.Line(this.x, this.y, this.parent.x, this.parent.y);
                this.link = scene.add.graphics({ lineStyle: { width: 2, color: 0xff0008 } });
                this.link.strokeLineShape(line1);
            } else {
                var line1 = new Phaser.Geom.Line(this.x, this.y, this.parent.x, this.parent.y);
                this.link = scene.add.graphics({ lineStyle: { width: 2, color: 0x000000 } });
                this.link.strokeLineShape(line1);
            }
        }
    }

    changeLinkColour(scene) {
        if (this.link != null) {
            if (this.isRed) {
                this.link.destroy();
                var line1 = new Phaser.Geom.Line(this.x, this.y, this.parent.x, this.parent.y);
                this.link = scene.add.graphics({ lineStyle: { width: 2, color: 0xff0008 } });
                this.link.strokeLineShape(line1);
            } else {
                this.link.destroy();
                var line1 = new Phaser.Geom.Line(this.x, this.y, this.parent.x, this.parent.y);
                this.link = scene.add.graphics({ lineStyle: { width: 2, color: 0x000000 } });
                this.link.strokeLineShape(line1);
            }
        }
    }

}