# Supabase Integration Examples

This guide provides examples of common Supabase operations you can use in your HormoiQ app.

## Authentication

### Sign Up

```typescript
import { supabase } from '@/lib/supabase';

const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing up:', error.message);
    return null;
  }
  
  return data.user;
};
```

### Sign In

```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
    return null;
  }
  
  return data.user;
};
```

### Sign Out

```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error.message);
  }
};
```

### Get Current User

```typescript
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

### Reset Password

```typescript
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'hormoiq://reset-password',
  });
  
  if (error) {
    console.error('Error resetting password:', error.message);
  }
};
```

## Database Operations

### Create a Table (SQL)

First, create a table in your Supabase dashboard (Database > SQL Editor):

```sql
-- Example: Create a profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policy: Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Create policy: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
```

### Insert Data

```typescript
const createProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email: profileData.email,
        full_name: profileData.fullName,
      }
    ])
    .select();
  
  if (error) {
    console.error('Error creating profile:', error.message);
    return null;
  }
  
  return data;
};
```

### Read Data

```typescript
// Get single record
const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  
  return data;
};

// Get multiple records with filters
const getRecentRecords = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching records:', error.message);
    return [];
  }
  
  return data;
};
```

### Update Data

```typescript
const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  
  if (error) {
    console.error('Error updating profile:', error.message);
    return null;
  }
  
  return data;
};
```

### Delete Data

```typescript
const deleteRecord = async (recordId: string) => {
  const { error } = await supabase
    .from('your_table')
    .delete()
    .eq('id', recordId);
  
  if (error) {
    console.error('Error deleting record:', error.message);
    return false;
  }
  
  return true;
};
```

## Real-time Subscriptions

### Listen to Table Changes

```typescript
import { useEffect } from 'react';

const useRealtimeSubscription = (tableName: string, callback: (payload: any) => void) => {
  useEffect(() => {
    // Subscribe to changes
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log('Change received!', payload);
          callback(payload);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, callback]);
};

// Usage
useRealtimeSubscription('messages', (payload) => {
  console.log('New message:', payload.new);
});
```

### Listen to Specific Row

```typescript
const subscribeToProfile = (userId: string, callback: (profile: any) => void) => {
  const subscription = supabase
    .channel(`profile_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
};
```

## File Storage

### Upload File

```typescript
const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError.message);
    return null;
  }

  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### Upload from React Native

```typescript
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

const pickAndUploadImage = async (userId: string) => {
  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (result.canceled) {
    return null;
  }

  const image = result.assets[0];
  
  // Convert to blob
  const response = await fetch(image.uri);
  const blob = await response.blob();
  
  const fileExt = image.uri.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, blob, {
      contentType: `image/${fileExt}`,
    });

  if (uploadError) {
    console.error('Error uploading:', uploadError.message);
    return null;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### Download File

```typescript
const downloadFile = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .download(filePath);

  if (error) {
    console.error('Error downloading file:', error.message);
    return null;
  }

  return data;
};
```

### Delete File

```typescript
const deleteFile = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting file:', error.message);
    return false;
  }

  return true;
};
```

## React Hooks Examples

### Custom Hook for Data Fetching

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabaseQuery<T>(
  tableName: string,
  options?: { filter?: any; order?: any }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase.from(tableName).select('*');

        if (options?.filter) {
          query = query.eq(options.filter.column, options.filter.value);
        }

        if (options?.order) {
          query = query.order(options.order.column, {
            ascending: options.order.ascending ?? true,
          });
        }

        const { data: result, error: queryError } = await query;

        if (queryError) throw queryError;

        setData(result || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, JSON.stringify(options)]);

  return { data, loading, error };
}

// Usage
const MyComponent = () => {
  const { data, loading, error } = useSupabaseQuery<Profile>('profiles', {
    filter: { column: 'id', value: userId },
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <View>{/* Render data */}</View>;
};
```

### Custom Hook for Real-time Data

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabaseRealtime<T>(tableName: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      const { data: result } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (result) setData(result);
    };

    fetchData();

    // Subscribe to changes
    const subscription = supabase
      .channel(`${tableName}_realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((current) => [payload.new as T, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setData((current) =>
              current.map((item: any) =>
                item.id === payload.new.id ? (payload.new as T) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((current) =>
              current.filter((item: any) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName]);

  return data;
}

// Usage
const MessagesScreen = () => {
  const messages = useSupabaseRealtime<Message>('messages');

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem message={item} />}
    />
  );
};
```

## Error Handling

### Comprehensive Error Handler

```typescript
export const handleSupabaseError = (error: any) => {
  if (error.message.includes('duplicate key')) {
    return 'This record already exists.';
  }
  
  if (error.message.includes('violates foreign key constraint')) {
    return 'Related record not found.';
  }
  
  if (error.message.includes('permission denied')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.message.includes('invalid input syntax')) {
    return 'Invalid data format.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Usage
try {
  await supabase.from('profiles').insert(data);
} catch (error) {
  const message = handleSupabaseError(error);
  Alert.alert('Error', message);
}
```

## TypeScript Types

### Define Your Types

```typescript
// types/database.ts
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Use with Supabase
const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return error ? null : data;
};
```

## Best Practices

1. **Always handle errors** - Display user-friendly messages
2. **Use transactions** when updating multiple tables
3. **Implement retry logic** for network failures
4. **Cache data** when appropriate to reduce API calls
5. **Clean up subscriptions** in useEffect cleanup functions
6. **Use TypeScript types** for type safety
7. **Implement loading states** for better UX
8. **Use Row Level Security (RLS)** to protect data
9. **Index frequently queried columns** for performance
10. **Test edge cases** and error scenarios

## Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)

