class BSTIntroduction extends Phaser.Scene {

    constructor() {
        super({ key:'BSTIntroduction' });
    }

    
    preload() {
         this.load.image('tree', 'Assets/tree1.jpg');
    }

    create() {
        // Switches from this scene to SerchLinked
        var spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spacebar.on('down', () => {
           this.scene.switch('SearchLinked');
        });

        this.add.text(650,30, 'What is a BST?\n\n', { font: 'bold 30px Courier', fill: '#000', textAlign: 'center'});
        this.add.text(500, 100, 'Press Space if you know the BST concepts', { font: '20px Courier', fill: '#eb4034', textAlign: 'center'})
         var txt = this.make.text({
            x: 810,
            y: 300,
            text: 'A Binary Search Tree (BST) is a data structure that looks much like a physical tree from the natural world. It is structured using objects called nodes. Every node has a key. Every tree starts with a root node, which is the starting point of all operations performed on the tree. The root node (parent) is connected only to two other nodes (children) through links - because of that the tree is called a binary tree. The tree property requires that every child node to the left has a smaller key than the parent and every child node to the right has a bigger key than the parent. Null key indicates that a node doesn’t have an assigned key and has no links (children).\n\nThe Binary Search Tree is a structure that can contain multiple subtrees. The child of every parent is a root of a subtree.This data structure helps to organise data more quickly. Binary search trees are primarily used for searching and sorting operations.',
            origin: { x: 0.5, y: 0.5 },
            style: {
                fontSize:'28px ',
                fill: 'black',
                wordWrap: { width: 1600 }
            },
        });

        var txt1 = this.make.text({
            x: 430,
            y: 600,
            text: 'To carry out any operation in the Binary Search Tree you have to find the correct node on which to perform the operation. For deletion and search that would be a node whose key is not null (existing node that has a key). For inserting that would be a node that has a null key (gray nodes)',
            origin: { x: 0.5, y: 0.5 },
            style: {
                fontSize:'28px ',
                fill: 'black',
                align: 'justify',
                wordWrap: { width: 850 }
            },
        });
        var treePicture = this.add.image(1100, 700, 'tree'). setScale(0.4);
      
    }

    update() {

    }
}