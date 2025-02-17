import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
}

const Button = ({
  label,
  variant = 'primary',
  icon,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      className={`mt-3 h-12 flex-row items-center justify-center rounded-lg ${
        variant === 'primary'
          ? 'bg-primary-60'
          : 'border border-gray-300 bg-white'
      }`}
      {...props}
    >
      {icon && (
        <View className="mr-2">
          <Ionicons
            name={icon}
            size={20}
            color={variant === 'primary' ? 'white' : 'black'}
          />
        </View>
      )}
      <Text
        className={`font-cereal-bold text-base ${
          variant === 'primary' ? 'text-white' : 'text-black'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
