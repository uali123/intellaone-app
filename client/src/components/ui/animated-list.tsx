import { motion } from "framer-motion";
import { staggerContainerAnimation, staggerItemAnimation } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

interface AnimatedListProps extends React.HTMLAttributes<HTMLUListElement> {
  items: React.ReactNode[];
  as?: "ul" | "ol";
  staggerDelay?: number;
}

export function AnimatedList({ 
  items, 
  as = "ul", 
  className,
  staggerDelay = 0.05, 
  ...props 
}: AnimatedListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const ListTag = as === "ul" ? "ul" : "ol";

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("", className)}
      {...props}
    >
      {items.map((item, index) => (
        <motion.li
          key={index}
          variants={staggerItemAnimation}
          className="origin-left"
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}

interface AnimatedListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export function AnimatedListItem({ children, className, ...props }: AnimatedListItemProps) {
  return (
    <motion.li
      variants={staggerItemAnimation}
      className={cn("origin-left", className)}
      {...props}
    >
      {children}
    </motion.li>
  );
}