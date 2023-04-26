 class Coordinate {
    private readonly x: number;
    private readonly y: number;

    constructor(x:number=0, y:number=0) {
        this.x = x;
        this.y = y;
    }

    // New coordinate of (0, 0)
    public static zero(): Coordinate { return new Coordinate(0, 0);}

    // Get x and y
    public getX(): number { return this.x;}
    public getY(): number { return this.y;}

    // Get length (vector)
    public getLength(): number { return Math.sqrt((this.x*this.x)+(this.y*this.y));}
    public getLengthSqr(): number { return (this.x*this.x)+(this.y*this.y);}

    // Set length (vector)
    public setLength(newLength:number): Coordinate {
        const length = newLength/Math.sqrt((this.x*this.x)+(this.y*this.y));
        return new Coordinate(
            this.x*length,
            this.y*length
        );
    }
    
    // Get normalized (vector)
    public getNormal(): Coordinate {
        const length = 1/Math.sqrt((this.x*this.x)+(this.y*this.y))
        return new Coordinate(
            this.x*length,
            this.y*length
        );
    }
    
    // Arithmetic
    public add(other:Coordinate): Coordinate {
        return new Coordinate(
            this.x+other.x,
            this.y+other.y
        );
    }
    public sub(other:Coordinate): Coordinate {
        return new Coordinate(
            this.x-other.x,
            this.y-other.y
        );
    }
    public mul(other:Coordinate): Coordinate {
        return new Coordinate(
            this.x*other.x,
            this.y*other.y
        );
    }
    public scale(other:number): Coordinate {
        return new Coordinate(
            this.x*other,
            this.y*other
        );
    }
    public pow(other:Coordinate): Coordinate {
        return new Coordinate(
            this.x^other.x,
            this.y^other.y
        );
    }
}
