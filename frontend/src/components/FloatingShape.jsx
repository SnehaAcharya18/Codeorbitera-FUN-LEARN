import { motion } from "framer-motion";

const FloatingShape = ({ size, top, left, delay }) => {
	return (
		<motion.div
			className={`absolute rounded-full bg-gradient-to-r from-purple-500 to-violet-600 ${size} opacity-25 blur-2xl`}
			style={{ top, left }}
			animate={{
				y: ["0%", "100%", "0%"],
				x: ["0%", "100%", "0%"],
				rotate: [0, 360],
			}}
			transition={{
				duration: 20,
				ease: "linear",
				repeat: Infinity,
				delay,
			}}
			aria-hidden="true"
		/>
	);
};
export default FloatingShape;
