'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useAuth} from '@/components/AuthProvider';
import {useToast} from '@/hooks/use-toast';

export const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signUp} = useAuth();
  const {toast} = useToast();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await signUp(email, password, name);
      toast({
        title: 'Sign up successful',
        description: 'Your account has been created.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: 'Failed to create account. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit">Sign Up</Button>
    </form>
  );
};
