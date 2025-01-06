class Stack {
    constructor() {
        this.items = [];
    }

    push(data) {
        this.items.push(data);
    }

    pop() {
        if(this.isEmpty()) {
            throw new Error("Stack is empty");
        }
        return this.items.pop();
    }

    top() {
        if(this.isEmpty()) {
            throw new Error("Stack is empty");
        }
        return this.items[this.items.length-1];
    }

    isEmpty() {
        return this.items.length == 0;
    }

    size() {
        return this.items.length();
    }

    clear() {
        this.items = [];
    }
}