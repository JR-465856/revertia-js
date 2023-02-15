 class Coordinate {
    public x: number = 0;
    public y: number = 0;

    constructor(x:number=0, y:number=0) {
        this.x = x;
        this.y = y;
    }

    public static zero(): Coordinate { return new Coordinate(0, 0);}

    public clone(): Coordinate {
        let returnCoord = new Coordinate();
        returnCoord.x = this.x;
        returnCoord.y = this.y;
        return returnCoord;
    }
    
    // Arithmetic
    public add(other:Coordinate): Coordinate {
        let self = this.clone();
        self.x = self.x + other.x;
        self.y = self.y + other.y;
        return self;
    }
    public sub(other:Coordinate): Coordinate {
        let self = this.clone();
        self.x = self.x - other.x;
        self.y = self.y - other.y;
        return self;
    }
    public mul(other:any): Coordinate {
        let self = this.clone();
        if (other instanceof Coordinate) {
            self.x = self.x * other.x;
            self.y = self.y * other.y;
            return self;
        } else if (typeof other === "number") {
            self.x = self.x * other;
            self.y = self.y * other;
            return self;
        }
        throw "Expected Coordinate or number, got" + typeof other + "."
        return this;
    }
    public div(other:any): Coordinate {
        let self = this.clone();
        if (other instanceof Coordinate) {
            self.x = self.x / other.x;
            self.y = self.y / other.y;
            return self;
        } else if (typeof other === "number") {
            self.x = self.x / other;
            self.y = self.y / other;
            return self;
        }
        throw "Expected Coordinate or number, got" + typeof other + "."
        return this;
    }
    public pow(other:any): Coordinate {
        let self = this.clone();
        if (other instanceof Coordinate) {
            self.x = self.x ^ other.x;
            self.y = self.y ^ other.y;
            return self;
        } else if (typeof other === "number") {
            self.x = self.x ^ other;
            self.y = self.y ^ other;
            return self;
        }
        throw "Expected Coordinate or number, got" + typeof other + "."
        return this;
    }
}