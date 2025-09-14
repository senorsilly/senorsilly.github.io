class Equipment {
    constructor(name, type, description, stats = {}, levelRequirement = 0, value = 0, sprite = null, slot, icon) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.stats = stats;
        this.levelRequirement = levelRequirement;
        this.value = value;
        this.sprite = sprite;
        this.slot = slot;
        this.icon = icon;
        this.quantity = 1;
    }
}

export { Equipment };