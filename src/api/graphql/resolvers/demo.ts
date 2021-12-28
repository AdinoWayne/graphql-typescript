export const demoResolvers = {
	demos: async () => {
		const value = {
			name: "this is name",
			posts: [
				{
					name: "_name",
					content: "_content",
				}
			]
		}
		return value;
	},
    demo: async ({ id }: { id: String}) => {
		const value = {
			name: `this is name ${id}`,
			posts: [
				{
					name: "_name",
					content: "_content",
				}
			]
		}
		return value;
	},
}