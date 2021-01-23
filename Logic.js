 const POPULATION_SIZE = 52
 const MATING_POOL_SIZE = POPULATION_SIZE/2
 const REPRODUCTION_RATE = 2
 const MUTATION_PROBABILITY = 0.15
 const MUTATION_RATE = 0.15

 const STARTIING_POINT = 150
 const ENDING_POINT = 60
 const FIELD_HEIGHT = 100
 const NODES = 30

 const G = 9.81

class Generation {
	members = []

	constructor(members = []){
		this.members = members
	}

	static createRandom(){
		let g = new Generation()
		g.members = g.generatePopulation()
		return g
	}

	get meanFitness(){
		let nonInfinities = this.members.filter(m=>m.fitness != Infinity)
		return nonInfinities.reduce((a,b)=> a + b.fitness, 0)/nonInfinities.length
	}

	orderByFitness(){
		this.members.sort((a, b)=>a.fitness - b.fitness)
	}

	generatePopulation() {
		return Array.from({length: POPULATION_SIZE}, Member.createRandom)
	}

	newGeneration() {
		this.orderByFitness()
		let matingPool = this.members.slice(0, MATING_POOL_SIZE)
		
		Generation.shuffleArray(matingPool)
		let newMembers = []
		for (let i = 0; i < MATING_POOL_SIZE/2; i++){
			let father = matingPool.pop()
			let mother = matingPool.pop()
			let children = Member.mate(father, mother)
			//console.log(children)
			children.map(child => newMembers.push(child))
		}
		return new Generation(newMembers)
	}

	static shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
}

class Member {
	#points = []

	fitness = Infinity

	constructor(points = []){
		this.points = points
	}

	get points() {
		return this.#points
	}

	set points(p) {
		this.#points = p
		this.calculateFitness()
	}

	calculateFitness(){
		let v0 = 0
		let time = 0
		for (let i = 0; i < this.#points.length - 1; i++){
			let dx = 1
			let dy = this.#points[i] - this.#points[i + 1]
			//let length = Math.sqrt(dy**2 + dx**2)
			let alpha = Math.atan2(dy, dx)
			let acc = G * Math.sin(alpha)
			let dt
			if (acc !== 0){
				let h0 = this.#points[i]
				let h1 = this.#points[i+1]
				if (v0**2 + 2*G*(h0-h1) < 0) {
					this.fitness = Infinity
					return
				}
				let v1 = Math.sqrt(Math.abs(v0**2 + 2*G*(h0-h1)))
				dt = Math.abs((v1-v0)/acc)
				
				v0 = v1
			} else {
				dt = dx / v0
			}
			
			//console.log(dy, dt)
			time += dt		
		}
		this.fitness = time
	}

	static createRandom(){
		let m = new Member()
		let points = Array.from({length: NODES-2}, () => Math.ceil(Math.random() * (STARTIING_POINT - 1)))
		points.unshift(STARTIING_POINT)
		points.push(ENDING_POINT)
		m.points = points
		return m
	}

	static mate(father, mother) {
		let children = []
		for (let i = 0; i < REPRODUCTION_RATE; i++) {
			let sliceIndex = Math.floor(Math.random() * NODES)
			let points1 = father.points.slice(0, sliceIndex).concat(mother.points.slice(sliceIndex))
			let child1 = new Member(points1)
			let points2 = mother.points.slice(0, sliceIndex).concat(father.points.slice(sliceIndex))
			let child2 = new Member(points2)
			child1.mutate()
			child2.mutate()
			children.push(child1)
			children.push(child2)
		}
		return children
	}

	mutate() {
		this.#points = this.#points.map((p, index)=>{
			if (index == 0 || index == NODES-1) return p
			if (Math.random() <= MUTATION_PROBABILITY) {
				return (1 + MUTATION_RATE - (Math.random() * 2 * MUTATION_RATE)) * p
			} else {
				return p
			}
		})
		this.calculateFitness()
	}

}