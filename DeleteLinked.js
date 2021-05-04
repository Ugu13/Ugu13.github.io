class DeleteLinked extends Phaser.Scene {

    constructor() {
        super({ key:'DeleteLinked' });
    }

    preload() {
        this.load.spritesheet('onion', 'Assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {

        // *************VARIABLES*************
        // Used to offset y of player so that it does not fall off the node during setPosition
        const BUFFER = 60;
        // Used for intializing overlap of node with node, to be able to redraw the tree only when it expands
        var nodearray = [];
        // Global tree dpth is stored here
        var treedpth = 0;
        // A constant used for calculating distances between nodes
        const w = 80;

        // *************SCENE SPECIFIC CODE*************
        // Text on top of the game world
        var text1 = this.add.text(2000,100, 'Level 3: Delete', { fontSize: '30px', fill: '#000' });
        //Instructions
        var text2 = this.add.text(2700,100, 'Instructions:\n⌫ delete (BACKSPACE)\n← move to the left child\n→ move to the right child\n↑ move to the parent', { fontSize: '27px', fill: '#000' });

         // Clafifications on the Insert Operation
         var text3 = this.make.text({
            x: 2700,
            y: 1000,
            text: 'You always start searching from the root. To find a key in the tree you have to compare it with the root key and go left if it’s smaller or go right if it’s bigger than the root key. You have to repeat this step until the key of node you are on is equal to the key you’re looking for - that’s when you stop and delete (press BACKSPACE). Sometimes the delete operation is more complicated than that - if the node you’re deleting has two children, you need to replace the deleted node with the leftmost node in the right subtree of the deleted node. In this case you’ll be asked to show which node should replace the node you want to delete (by pressing ENTER).',
            origin: { x: 0.5, y: 0.5 },
            style: {
                fontSize:'28px ',
                fill: 'black',
                align: 'justify',
                wordWrap: { width: 1600 }
            },
        });

        var text4 = this.add.text(2300,1130, 'To go back to the home page press ESC', { fontSize: '30px', fill: '#000' });

        // Go back to the home page
        var keyEscape = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        keyEscape.on('down', () => {
            this.scene.switch('BSTIntroduction');
        });

        // Switches from this scene to InsertionLinked
        // var spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // spacebar.on('down', () => {
        //     this.scene.stop('DeleteLinked');
        //     this.scene.start('SearchLinked');
        // });

         // Restart the current scene
        var keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyR.on('down', () => {
            destroyEverything();
            this.scene.restart('DeleteLinked');
            this.input.keyboard.removeAllKeys(true);
        });

        // *************PLAYER*************
        var player = this.physics.add.sprite(2500, 300, 'onion');
        player.setBounce(0.1);

        var cursors = this.input.keyboard.createCursorKeys();

        // *************CAMERA AND ZOOM*************
        this.cameras.main.setBounds(0, 0, 5000, 5000);
        // this.cameras.main.startFollow(player, true, 0.08, 0.08);
        this.cameras.main.centerOn(2615,500);
        this.cameras.main.zoom = 0.7;
        // this.cameras.main.startFollow(player, true, 0.05, 0.05);

        // var isZoomed = true;
        // var keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        // keyZ.on('down', function () {
        //     var cam = this.cameras.main;
        //     if(isZoomed) {  // zoom out
        //         cam.stopFollow();
        //         cam.pan(root.x, root.y, 2000, 'Power2'); //x to pan to, y to pan to, pan speed?, pan mode
        //         cam.zoomTo(0.5, 1000);//zoom distance, duration/speed of zoom
        //         isZoomed = false;
        //     } else { // zoom in
        //         cam.startFollow(player, true, 0.05, 0.05);
        //         // cam.pan(player.x, player.y, 2000, 'Power2'); //x to pan to, y to pan to, pan speed?, pan mode
        //         cam.zoomTo(1, 1000);//zoom distance, duration/speed of zoom
        //         isZoomed = true;
        //     }
        // }, this);

        // this.cameras.world.setBounds(0, 0, 600, 2000);
        // player.setCollideWorldBounds(true);

        // *************INITIALIZE BST*************
        // Array of nodes to be inserted into BST automatically by insertNodes
        var numsToInsert = [33,1,14,5,17,16,55,50,70,48,53,60,80,3,77];
        //var numsToInsert = [28,13,77,7,21,50,100,18];
        // var numsToInsert = [33,11,44,10,12,55,5,13,50,70,3,8,17,48,53,60,80,4];
        // var numsToInsert = ["S","E","X","A","R","C","H","M"]
        
        // BST (intially an empty/null root node)
        var root = createRoot(this);
        // Inserts the elements from the array above (numsToInsert)
        createTree(this);

        root.setDepth(1);
        
        function createRoot(scene) {
            var root = new BSTNode(scene, 2500, 300, 'null', makeNodeGraphics('null',scene));
            root.dpth = 0;
            root.setSize(55,55);
            scene.physics.add.existing(root, 1);
            scene.physics.add.overlap(player, root, deleteNode, cursorDownIsPressed, scene);
            // for the curtain:
            scene.physics.add.overlap(player, root, revealValue, null, scene);
            scene.physics.add.collider(player, root);
            return root;
        }

        function cursorDownIsPressed() {
            var moveAllowed = false;
            if (cursors.down.isDown) { 
                moveAllowed = true;
            }
            return moveAllowed;
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
                var dpth = node.dpth;
                var parent = node.parent;
                var q = node.distanceFromParent;
                
                var newNode = new BSTNode(scene, x, y, key, makeNodeGraphics(key,scene));
                newNode.dpth = dpth;
                newNode.parent = parent;
                newNode.setSize(55,55);
                newNode.drawLinkToParent(scene);
                scene.physics.add.existing(newNode, 1);
                nodearray.push(newNode);
                newNode.distanceFromParent = q;
                newNode.setDepth(1);

                // if the dpth that the current node is at is 0, then it means
                // a new root is being created here so we need to update the global root.
                if (dpth == 0) {
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
                childL.dpth = dpth+1;
                childL.setSize(55,55);
                scene.physics.add.existing(childL, 1);
                newNode.left = childL;
                childL.drawLinkToParent(scene);
                nodearray.push(childL);
                childL.distanceFromParent = -w;
                childL.setDepth(1);

                var childR = new BSTNode(scene, x+w, y+w, 'null',makeNodeGraphics('null',scene));
                childR.parent = newNode;
                childR.dpth = dpth+1;
                childR.setSize(55,55);
                scene.physics.add.existing(childR, 1);
                newNode.right = childR;
                childR.drawLinkToParent(scene);
                nodearray.push(childR);
                childR.distanceFromParent = w;
                childR.setDepth(1);

                // teleporting
                scene.physics.add.overlap(player, newNode, teleportLeft, cursorLeftIsPressed, scene);
                scene.physics.add.overlap(player, newNode, teleportRight, cursorRightIsPressed, scene);
                scene.physics.add.overlap(player, newNode, teleportUp, cursorUpIsPressed, scene);

                scene.physics.add.overlap(player, childL, teleportUp, cursorUpIsPressed, scene);
                scene.physics.add.overlap(player, childR, teleportUp, cursorUpIsPressed, scene);

                // delete
                scene.physics.add.overlap(player, newNode, deleteNode, backspaceIsPressed, scene);
                scene.physics.add.overlap(player, newNode, checkAndDeleteSecondNode, enterIsPressed, scene);

                // scene.physics.add.overlap(player, childL, deleteMin, cursorDownIsPressed, scene);

                // redraw
                scene.physics.add.collider(newNode, nodearray, redrawTree, null, scene);
                scene.physics.add.collider(childL, nodearray, redrawTree, null, scene);
                scene.physics.add.collider(childR, nodearray, redrawTree, null, scene);

                // curtain
                scene.physics.add.overlap(player, newNode, revealValue, null, scene);
                scene.physics.add.overlap(player, childL, revealValue, null, scene);
                scene.physics.add.overlap(player, childR, revealValue, null, scene);

                // player standing on nodes
                scene.physics.add.collider(player, newNode);
                scene.physics.add.collider(player, childL);
                scene.physics.add.collider(player, childR);

                player.setPosition(root.x,root.y-BUFFER);
                
                if (childL.dpth > treedpth) {
                    treedpth = childL.dpth;
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
        
       // ***************DELETION***************

        // elements to delete, one-by-one
        var tasks = [1,48,70];
        // displays what operations needs to be performed by the player
        var taskText = displayText(this);
        // for displaying feedback after completing tasks
        var feedback = this.add.text(2000,150, '', { fontSize: '20px', fill: '#000' });

        //while there are still some tasks in the array, displays text indicating what needs to be done
        //when tasks is empty then press P to continue to next lesson
        function displayText(scene) {
            if (tasks.length != 0) { 
                return scene.add.text(2000,175, 'Delete ' + tasks[0] + ' using BACKSPACE', { fontSize: '22px', fill: '#000' });
            } else {
                //feedback.destroy();
                //return scene.add.text(2000,150, 'Press P to continue', { fontSize: '60px', fill: '#0356f0' });
                return createButton(scene);//scene.add.text(2000,800, '', { fontSize: '60px', fill: '#F25278' });
            }
        }

        //**************MVP ONLY - BUTTON FOR FEEDBACK */
        function createButton(scene){
            var button = scene.add.text(1900,800, 'Click here to give us feedback', { fontSize: '60px', fill: '#F25278' }).setInteractive();
            button.on('pointerup', openExternalLink, scene);
            return button;
        }

        function openExternalLink ()
        {
            //TODO: add questions to the form 
            var url = 'https://forms.gle/N2PCDMRtzGG4JsAj8';
            var s = window.open(url);
            if (s && s.focus)
            {
                s.focus();
            }
            else if (!s)
            {
                window.location.href = url;
            }
        }


        var backspaceAllowed = false;
        var keybackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
        function backspaceIsPressed() {
            var moveAllowed = false;
            if (keybackspace.isDown) {
                backspaceAllowed = true;
            }
            if (backspaceAllowed && keybackspace.isUp) {
                moveAllowed = true;
                backspaceAllowed = false;
            }
            return moveAllowed;
        }

        var nodeToDelete = null;

        function deleteNode(player, node) {
            if (node.key != 'null' && tasks[0] == node.key && nodeToDelete == null) {
                if (node.left.key =='null' && node.right.key =='null') { //  both children are null 
                    node.key = 'null';
                    node.left.link.destroy();
                    node.right.link.destroy();
                    node.left.destroy();
                    node.right.destroy();
                    node.left = null;
                    node.right = null;
                    treedpth = height(root);
                    redraw(root,this);
                    player.setPosition(root.x,root.y-BUFFER);
                    feedback.destroy();
                    feedback = this.add.text(2350,400, 'Good job!!!', { fontSize: '40px', fill: '#49ab35' });
                    this.add.tween({
                        targets: feedback,
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        delay: 1000,
                        alpha: {
                          getStart: () => 100,
                          getEnd: () => 0
                        }
                    });                    
                    tasks.shift();
                    taskText.destroy();
                    taskText = displayText(this);
                } else if (node.right.key == 'null') { // right child is null
                    if(node.key == root.key) { // when node is root and right child is null
                        var x = root.x;
                        var y = root.y;
                        root = node.left;
                        root.x = x;
                        root.y = y;
                        root.parent = null;
                        root.dpth = 0;
                        node.right.link.destroy();
                        node.left.link.destroy();
                        node.right.destroy();
                        node.destroy();
                        // treedpth = height(root);
                        // redraw(root,this);
                        // player.setPosition(root.x,root.y-BUFFER);
                    }
                    node.key = node.left.key;
                    node.left.link.destroy();
                    node.right.link.destroy();
                    node.left.destroy();
                    node.right.destroy();
                    // update children
                    node.right = node.left.right;
                    node.left = node.left.left;
                    treedpth = height(root);
                    redraw(root,this);
                    player.setPosition(root.x,root.y-BUFFER);
                    feedback.destroy();
                    feedback = this.add.text(2350,400, 'Good job!!!', { fontSize: '40px', fill: '#49ab35' });
                    this.add.tween({
                        targets: feedback,
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        delay: 1000,
                        alpha: {
                          getStart: () => 100,
                          getEnd: () => 0
                        }
                    });                      
                    tasks.shift();
                    taskText.destroy();
                    taskText = displayText(this);
                } else if (node.left.key  == 'null')  { // left child is null
                    if(node.key == root.key) { // when node is root and left child is null
                        var x = root.x;
                        var y = root.y;
                        root = node.right;
                        root.x = x;
                        root.y = y;
                        root.parent = null;
                        root.dpth = 0;
                        node.left.link.destroy();
                        node.left.destroy();
                        node.right.link.destroy();
                        node.destroy();
                        // treedpth = height(root);
                        // redraw(root,this);
                        // player.setPosition(root.x,root.y-BUFFER);
                    }
                    node.key = node.right.key;
                    node.left.link.destroy();
                    node.right.link.destroy();
                    node.left.destroy();
                    node.right.destroy();
                    // update children
                    node.left = node.right.left;
                    node.right = node.right.right;
                    treedpth = height(root);
                    redraw(root,this);
                    player.setPosition(root.x,root.y-BUFFER);
                    feedback.destroy();
                    feedback = this.add.text(2350,400, 'Good job!!!', { fontSize: '40px', fill: '#49ab35' });
                    this.add.tween({
                        targets: feedback,
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        delay: 1000,
                        alpha: {
                          getStart: () => 100,
                          getEnd: () => 0
                        }
                    });                      
                    tasks.shift();
                    taskText.destroy();
                    taskText = displayText(this);
                } else { // both children are not null; setting a value of nodeToDelete to use it after user clicks Enter
                    nodeToDelete = node;
                    nodeToDelete.first.setFillStyle(0xff0090, 1);
                    feedback.destroy();
                    feedback = this.add.text(nodeToDelete.x-700,250, 'Now select the node you want to exchange the deleted node with.\nUse ↩ (ENTER).', { fontSize: '20px', fill: '#ff0090' });
                    //var key = min(node.right);
                    //node.key = key;
                }
                // treedpth = height(root);
                // redraw(root,this);
                // player.setPosition(root.x,root.y-BUFFER);
            }
            else{
                feedback.destroy();
                feedback = this.add.text(2350,400, 'Try again', { fontSize: '40px', fill: '#e058a0' });
                this.add.tween({
                    targets: feedback,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                    delay: 1000,
                    alpha: {
                      getStart: () => 100,
                      getEnd: () => 0
                    }
                });                
                if(nodeToDelete != null) //node.left.key  != 'null' && node.right.key  != 'null' && 
                {
                    feedback.destroy();
                    feedback = this.add.text(nodeToDelete.x-700,260, 'Now select the node you want to exchange the deleted node with.\nUse ↩ (ENTER).\nTRY AGAIN', { fontSize: '20px', fill: '#ff0090' });
                }else{
                    player.setPosition(root.x,root.y-BUFFER);
                }
            }
        }

        //code used on overlap when the user clicks Enter - part of the deleteNode logic for deleting nodes with two children

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

        function checkAndDeleteSecondNode(player, node){
            if(nodeToDelete != null && node.key != 'null'){
                var key = min(nodeToDelete.right);
                if(node.key == key){
                    nodeToDelete.key = node.key;
                    deleteMin(node);
                    redraw(root,this);
                    player.setPosition(root.x,root.y-BUFFER);
                    nodeToDelete = null; 
                    feedback.destroy();
                    feedback = this.add.text(2350,400, 'Good job!!!', { fontSize: '40px', fill: '#49ab35' });
                    this.add.tween({
                        targets: feedback,
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        delay: 1000,
                        alpha: {
                          getStart: () => 100,
                          getEnd: () => 0
                        }
                    });                      
                    tasks.shift();
                    taskText.destroy();
                    taskText = displayText(this);
                }
                else{
                    player.setPosition(nodeToDelete.x,nodeToDelete.y-BUFFER);
                    feedback.destroy();
                    feedback = this.add.text(nodeToDelete.x-700,260, 'Now select the node you want to exchange the deleted node with.\nUse ↩ (ENTER).\nTRY AGAIN', { fontSize: '20px', fill: '#ff0090' });
                }
            }
        }

        // HELPER FOR deleteNode
        // THIS FUNCTION IS USED IN THE deleteNode FUNCTION
        // deletes the min node
        function deleteMin(node){
            node.key = node.right.key;
            node.left.link.destroy();
            node.right.link.destroy();
            node.left.destroy();
            node.right.destroy();
            // update children
            node.left = node.right.left;
            node.right = node.right.right;
            treedpth = height(root);
        }

        // HELPER FOR deleteNode
        // THIS FUNCTION IS USED IN THE deleteNode FUNCTION
        // Returns min node.key of a tree
        function min(node) { 
            var keyToReturn = node.key;
            if (node != null && node.key != 'null'){
                if (node.left.key != 'null') {
                    keyToReturn = min(node.left);
                } else {
                    keyToReturn = node.key;
                    //deleteMin(node);
                }
            }
            return keyToReturn;
        }


        //NOT USED - TO DELETE?
        //CODE FOR OLD(!!!) DELETEMIN AND DELETEMAX

        // var keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        // keyD.on('down', () => {
        //     deleteMin(root,this);
        //     redraw(root, this);
        // });

        // var keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        // keyM.on('down', () => {
        //     deleteMax(root,this);
        //     redraw(root, this);
        // });

        // function deleteMin(node,scene) { 
        //     // The null nodes at the end of the tree will have null links
        //     if (node != null && node.key != 'null'){
        //         if (node.left.key != 'null') {
        //             deleteMin(node.left,scene);
        //         } else if (node.parent==null) { //root
        //             if (node.left == 'null' && node.right == 'null') { // when root has no children
        //                 node.destroy();
        //                 node.left.link.destroy()
        //                 node.left.destroy()
        //                 node.right.link.destroy()
        //                 node.right.destroy()
        //                 root = createRoot(scene);
        //                 treedpth = height(root);
        //                 console.log(root.key)
        //                 return root.key
        //             } else { // when root has one child (root will be right child)
        //                 var x = root.x;
        //                 var y = root.y;
        //                 root = node.right
        //                 root.x = x;
        //                 root.y = y;
        //                 root.parent = null;
        //                 root.dpth = 0
        //                 node.left.link.destroy()
        //                 node.left.destroy()
        //                 node.right.link.destroy()
        //                 node.destroy()
        //                 treedpth = height(root)
        //             }
        //         } else { //any other node
        //             node.key = node.right.key;
        //             node.left.link.destroy();
        //             node.right.link.destroy();
        //             node.left.destroy();
        //             node.right.destroy();
        //             // update children
        //             node.left = node.right.left;
        //             node.right = node.right.right;
        //             treedpth = height(root);
        //         }
        //     }
        // }

        // function deleteMax(node,scene) {
        //     // The null nodes at the end of the tree will have null links
        //     if (node != null && node.key != 'null'){
        //         if (node.right.key != 'null') {
        //             deleteMax(node.right,scene);
        //         } else if (node.parent==null) { //root
        //             if (node.left == 'null' && node.right == 'null') { // when root has no children
        //                 node.destroy();
        //                 node.left.link.destroy()
        //                 node.left.destroy()
        //                 node.right.link.destroy()
        //                 node.right.destroy()
        //                 root = createRoot(scene);
        //                 treedpth = height(root);
        //             } else { // when root has one child (root will be left child)
        //                 var x = root.x;
        //                 var y = root.y;
        //                 root = node.left
        //                 root.x = x;
        //                 root.y = y;
        //                 root.parent = null;
        //                 root.dpth = 0
        //                 node.right.link.destroy()
        //                 node.left.link.destroy()
        //                 node.right.destroy()
        //                 node.destroy()
        //                 treedpth = height(root)
        //             }
        //         } else { //any other node
        //             node.key = node.left.key;
        //             node.left.link.destroy();
        //             node.right.link.destroy();
        //             node.left.destroy();
        //             node.right.destroy();
        //             // update children
        //             node.right = node.left.right;
        //             node.left = node.left.left;
        //             treedpth = height(root);
        //         }
        //     }
        // }

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
                var dpth = node.dpth;

                var newNode;

                if (dpth > 0) {
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

                newNode.dpth = dpth;
                newNode.parent = parent;
                newNode.left = left;
                newNode.right = right;
                newNode.distanceFromParent = q;
                newNode.setSize(55,55);
                scene.physics.add.existing(newNode, 1);

                if (dpth == 0) {
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
                newNode.setDepth(1);

                // teleporting
                if (key != 'null') {
                    scene.physics.add.overlap(player, newNode, teleportLeft, cursorLeftIsPressed, scene);
                    scene.physics.add.overlap(player, newNode, teleportRight, cursorRightIsPressed, scene);
                    // curtain
                    scene.physics.add.overlap(player, newNode, revealValue, null, scene);
                }
                scene.physics.add.overlap(player, newNode, teleportUp, cursorUpIsPressed, scene);

                // delete
                scene.physics.add.overlap(player, newNode, deleteNode, backspaceIsPressed, scene);
                scene.physics.add.overlap(player, newNode, checkAndDeleteSecondNode, enterIsPressed, scene);

                // player standing on node
                scene.physics.add.collider(player, newNode);

                // redraw
                scene.physics.add.collider(newNode, nodearray, redrawTree, null, scene);


                redraw(newNode.left,scene);
                redraw(newNode.right,scene);
            }
        }

        // ***************HELPERS***************

        // calculates the the dpth of the tree
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
            var curtain = scene.add.rectangle(0, 0, 55, 55, 0xbd96d4);
            curtain.setName('curtain');
            var shape = scene.add.rectangle(0, 0, 55, 55, 0x9ad9d7);
            shape.setName('shape');
            var keyString;
            if (key == 'null') { //if key is null then the node colour is gray
                shape.setFillStyle(0xb0b3b0, 1);
                keyString = scene.add.text(0,0, '' + key, { fontSize: '20px', fill: '#5e5e5e' });
                keyString.setName('keyString');
            } else {
                keyString = scene.add.text(0,0, '' + key, { fontSize: '20px', fill: '#000' });
                keyString.setName('keyString');
            }
            Phaser.Display.Align.In.Center(keyString, shape);
            array.push(shape);
            array.push(keyString);
            if(key != 'null'){
                array.push(curtain);
            }
            return array;
        }

        function destroyEverything() {
            player.destroy();
            destroyBST(root);
            nodearray = null;
            root = null;
            text1.destroy();
            text2.destroy();
            text3.destroy();
            text4.destroy();
            feedback.destroy();
            taskText.destroy();
        }

        function destroyBST(node) {
            if (node != null) {
                destroyBST(node.left);
                destroyBST(node.right);
                if (node.link != null) {
                    node.link.destroy();
                }
                node.destroy();
            }
        }

    }

    update() {

    }
}
