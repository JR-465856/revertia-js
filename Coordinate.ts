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