import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';


export default function CardWithBubbles({ height, width }: { height: number; width: number }) {
  // Bubble size (diameter)
  const bubbleSize = 70;
  
  // Create animated values for each bubble
  const bubble1 = useRef({
    x: new Animated.Value(width * 0.2),
    y: new Animated.Value(height * 0.2)
  }).current;
  
  const bubble2 = useRef({
    x: new Animated.Value(width * 0.5),
    y: new Animated.Value(height * 0.5)
  }).current;
  
  const bubble3 = useRef({
    x: new Animated.Value(width * 0.8),
    y: new Animated.Value(height * 0.3)
  }).current;
  
  // Animation references to control and stop them
  const animations = useRef<Animated.CompositeAnimation[]>([]);
  
  // Function to create a random target position that includes the edges
  const getRandomPosition = useCallback((isX: boolean) => {
    if (isX) {
      // Pour l'axe X, on veut que les bulles touchent parfois les bords
      // On génère un nombre entre 0 et 2
      const positionType = Math.floor(Math.random() * 3);
      
      if (positionType === 0) {
        // Position à l'extrême gauche (0)
        return 0;
      } else if (positionType === 1) {
        // Position à l'extrême droite (width - bubbleSize)
        return width - bubbleSize;
      } else {
        // Position aléatoire entre les deux extrêmes
        return Math.random() * (width - bubbleSize);
      }
    } else {
      // Pour l'axe Y, on garde le comportement normal
      // mais on permet d'aller jusqu'aux limites
      return Math.random() * (height - bubbleSize);
    }
  }, [width, height, bubbleSize]);
  
  // Create animation for a single bubble
  const createBubbleAnimation = useCallback((bubble: { x: Animated.Value; y: Animated.Value }) => {
    // Random duration between 0.5-1.5 seconds (beaucoup plus rapide)
    const duration = Math.random() * 1000 + 500;
    
    // Create animation sequence
    return Animated.parallel([
      Animated.timing(bubble.x, {
        toValue: getRandomPosition(true),
        duration,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(bubble.y, {
        toValue: getRandomPosition(false),
        duration,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ]);
  }, [getRandomPosition]);
  
  // Start a continuous animation for a bubble
  const startContinuousAnimation = useCallback((bubble: { x: Animated.Value; y: Animated.Value }) => {
    // Create the first animation
    const animation = createBubbleAnimation(bubble);
    
    // Store animation reference
    animations.current.push(animation);
    
    // Start animation with callback to create next animation when done
    animation.start(({ finished }) => {
      // Remove this animation from the references
      const index = animations.current.indexOf(animation);
      if (index > -1) {
        animations.current.splice(index, 1);
      }
      
      // If animation finished normally (not stopped) and component is mounted, start next animation
      if (finished) {
        startContinuousAnimation(bubble);
      }
    });
  }, [createBubbleAnimation]);
  
  // Start animations when component mounts
  useEffect(() => {
    if (__DEV__) {
      console.log('Starting bubble animations with container size:', { width, height });
    }
    
    // Start continuous animations for all bubbles
    startContinuousAnimation(bubble1);
    startContinuousAnimation(bubble2);
    startContinuousAnimation(bubble3);
    
    // Clean up on unmount
    return () => {
      // Stop all running animations
      animations.current.forEach(animation => animation.stop());
      animations.current = [];
      
      if (__DEV__) {
        console.log('Bubble animations stopped');
      }
    };
  }, [width, height, bubble1, bubble2, bubble3, startContinuousAnimation]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.bubble,
          {backgroundColor: '#FFFFFF99'},
          {
            transform: [
              { translateX: bubble1.x },
              { translateY: bubble1.y }
            ]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bubble,
          {backgroundColor: '#FFFFFF99'},
          {
            transform: [
              { translateX: bubble2.x },
              { translateY: bubble2.y }
            ]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bubble,
          {backgroundColor: '#FFFFFF99'},
          {
            transform: [
              { translateX: bubble3.x },
              { translateY: bubble3.y }
            ]
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E60000',
  },
  bubble: {
    height: 70,
    width: 70,
    position: 'absolute',
    borderRadius: 50,
    zIndex: 10,
  },
});