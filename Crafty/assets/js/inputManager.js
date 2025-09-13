class InputManager {
    constructor() {
        this.keys = {};
    }

    setupInputListeners() {
        console.log('InputManager: Setting up listeners...');
        document.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });

        document.addEventListener('keyup', (event) => {
            delete this.keys[event.key];
        });
    }

    isKeyDown(key) {
        return this.keys[key] || false;
    }
}
export default InputManager;