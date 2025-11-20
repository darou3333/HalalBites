import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ChefHat, Trash2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userService, recipeService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface Recipe {
  id: number;
  title: string;
  category: string;
  username: string;
  view_count: number;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsVisible(true);
    if (user?.role === 'admin') {
      fetchData();
    } else {
      navigate('/dashboard');
    }
  }, [user?.role, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users
      try {
        const usersData = await userService.getAll();
        setUsers(usersData || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }

      // Fetch recipes
      try {
        const recipesData = await recipeService.getAll();
        setRecipes(recipesData || []);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await userService.deactivate(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to DELETE this user permanently? This action cannot be undone.')) return;

    try {
      await userService.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await recipeService.delete(recipeId);
      setRecipes(recipes.filter(r => r.id !== recipeId));
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    }
  };

  const totalUpvotes = recipes.reduce((sum, r) => sum + (r.view_count || 0), 0);
  const avgUpvotes = recipes.length > 0 ? Math.round(totalUpvotes / recipes.length) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 dark:text-red-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-red-400/15 dark:bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-400/15 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-950/20 rounded-3xl border border-red-200/50 dark:border-red-800/50 shadow-lg">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl text-neutral-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Manage users, recipes, and platform settings
          </p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-neutral-600 dark:text-neutral-400 text-lg">Total Users</span>
            </div>
            <p className="text-4xl text-neutral-900 dark:text-white mb-1">{users.length}</p>
            <p className="text-neutral-500 dark:text-neutral-400">{users.filter(u => u.role !== 'admin').length} regular users</p>
          </div>

          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
                <ChefHat className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-neutral-600 dark:text-neutral-400 text-lg">Total Recipes</span>
            </div>
            <p className="text-4xl text-neutral-900 dark:text-white mb-1">{recipes.length}</p>
            <p className="text-neutral-500 dark:text-neutral-400">recipes uploaded</p>
          </div>

          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-950/20 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
                <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-neutral-600 dark:text-neutral-400 text-lg">Admin Accounts</span>
            </div>
            <p className="text-4xl text-neutral-900 dark:text-white mb-1">{users.filter(u => u.role === 'admin').length}</p>
            <p className="text-neutral-500 dark:text-neutral-400">administrators</p>
          </div>

          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                <span className="text-2xl">👁️</span>
              </div>
              <span className="text-neutral-600 dark:text-neutral-400 text-lg">Total Views</span>
            </div>
            <p className="text-4xl text-neutral-900 dark:text-white mb-1">{totalUpvotes}</p>
            <p className="text-neutral-500 dark:text-neutral-400">
              {avgUpvotes} avg per recipe
            </p>
          </div>
        </div>

        {/* Management Tabs */}
        <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Tabs defaultValue="users" className="w-full">
            <div className="border-b border-neutral-200 dark:border-neutral-800 px-8 pt-4">
              <TabsList className="bg-transparent h-16">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-600 dark:data-[state=active]:border-green-400 rounded-none px-6 text-lg text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="recipes" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-green-600 dark:data-[state=active]:border-green-400 rounded-none px-6 text-lg text-neutral-600 dark:text-neutral-400 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white"
                >
                  <ChefHat className="w-5 h-5 mr-2" />
                  Recipes
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Users Table */}
            <TabsContent value="users" className="p-8">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">ID</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Username</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Email</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Role</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Join Date</TableHead>
                      <TableHead className="text-right text-lg text-neutral-900 dark:text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-neutral-200 dark:border-neutral-800">
                        <TableCell className="text-neutral-600 dark:text-neutral-400">{user.id}</TableCell>
                        <TableCell className="text-neutral-900 dark:text-white font-medium">{user.username}</TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={`${user.role === 'admin' ? 'bg-red-600 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'} px-3 py-1.5 rounded-full`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user.role !== 'admin' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeactivateUser(user.id)}
                                  className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-900/20 rounded-lg px-3 py-1 text-sm"
                                >
                                  Deactivate
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="border-2 border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg p-2"
                                  title="Delete user permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {user.role === 'admin' && (
                              <span className="text-neutral-500 dark:text-neutral-400 text-sm">Admin - No actions</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Recipes Table */}
            <TabsContent value="recipes" className="p-8">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">ID</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Recipe Name</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Category</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Uploaded By</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Views</TableHead>
                      <TableHead className="text-lg text-neutral-900 dark:text-white">Upload Date</TableHead>
                      <TableHead className="text-right text-lg text-neutral-900 dark:text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow key={recipe.id} className="border-neutral-200 dark:border-neutral-800">
                        <TableCell className="text-neutral-600 dark:text-neutral-400">{recipe.id}</TableCell>
                        <TableCell className="text-neutral-900 dark:text-white font-medium">{recipe.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-3 py-1.5 rounded-full">
                            {recipe.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          {recipe.username || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          {recipe.view_count || 0}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="border-2 border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
    </div>
  );
}
