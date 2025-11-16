import { Home, Heart, Folder, Users, TrendingUp, Settings, Shield, ChevronLeft, Layers, FileText, LayoutDashboard, UserCog, Mail, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useTeams } from '../../hooks/useTeams';
import { UserRole } from '@aizu/shared';
import { cn } from '../../lib/utils';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  requireRole?: UserRole;
}

interface Team {
  id: string;
  name: string;
  color: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'My Prompts', icon: FileText, href: '/prompts' },
  { label: 'Collections', icon: Layers, href: '/collections' },
  { label: 'Favorites', icon: Heart, href: '/favorites' },
];

const discoverNavItems: NavItem[] = [
  { label: 'Trending', icon: TrendingUp, href: '/trending' },
  { label: 'All Teams', icon: Users, href: '/teams' },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', requireRole: UserRole.SUPER_ADMIN },
  { label: 'Teams', icon: Users, href: '/admin/teams', requireRole: UserRole.SUPER_ADMIN },
  { label: 'Users', icon: UserCog, href: '/admin/users', requireRole: UserRole.SUPER_ADMIN },
  { label: 'Invites', icon: Mail, href: '/admin/invites', requireRole: UserRole.SUPER_ADMIN },
  {
    label: 'Organization',
    icon: Building2,
    href: '/admin/organization',
    requireRole: UserRole.SUPER_ADMIN,
  },
];

// Color palette for team indicators
const teamColors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const location = useLocation();
  const { data: teams } = useTeams(user?.id ? { memberUserId: user.id } : undefined);

  const showAdminSection = user?.role === 'SUPER_ADMIN';
  
  // Map teams to include a color for the sidebar
  const teamsWithColor = teams?.map((team, index) => ({
    ...team,
    color: teamColors[index % teamColors.length],
  })) || [];

  return (
    <motion.aside
      layout
      transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
      style={{ width: isOpen ? '256px' : 'fit-content' }}
      className="border-r border-t bg-background flex flex-col rounded-tr-lg overflow-hidden"
    >
      {/* Company Section */}
      <div className="h-14 flex items-center justify-between border-b px-3">
        {isOpen ? (
          <>
            <div className="flex items-center gap-2 font-semibold px-4">
          {organization.logoUrl && (
            <img src={organization.logoUrl} alt={organization.name} className="h-6 w-6" />
          )}
              <motion.span
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.125 }}
                className="truncate"
              >
                {organization.name}
              </motion.span>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={onToggle} className="mx-auto">
            <motion.div
              animate={{ rotate: isOpen ? 0 : 180 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
                isCollapsed={!isOpen}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* My Teams Section */}
        <div>
          {isOpen && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.125 }}
              className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
            My Teams
            </motion.h3>
          )}
          <div className="space-y-1">
            {teamsWithColor.length > 0 ? (
              teamsWithColor.map((team) => (
                <TeamLink
                  key={team.id}
                  team={team}
                  isActive={location.pathname === `/teams/${team.id}`}
                  isCollapsed={!isOpen}
                />
              ))
            ) : (
              isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.125 }}
                  className="px-3 py-2 text-sm text-muted-foreground"
                >
                  No teams yet
                </motion.div>
              )
            )}
          </div>
        </div>

        {(teamsWithColor.length > 0 || isOpen) && <Separator />}

        {/* Discover Section */}
        <div>
          {isOpen && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.125 }}
              className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
            Discover
            </motion.h3>
          )}
          <div className="space-y-1">
            {discoverNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
                isCollapsed={!isOpen}
              />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {showAdminSection && (
          <>
            <Separator />
            <div>
              {isOpen && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.125 }}
                  className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                Admin
                </motion.h3>
              )}
              <div className="space-y-1">
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={location.pathname === item.href}
                    isCollapsed={!isOpen}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </nav>
    </motion.aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavLink({ item, isActive, isCollapsed }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
      className={cn(
        'rounded-md overflow-hidden',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
      )}
      style={{ borderRadius: '6px' }}
    >
      <Link
        to={item.href}
        className="relative flex h-10 w-full items-center text-sm font-medium"
        title={isCollapsed ? item.label : undefined}
      >
        <motion.div layout className="grid h-full w-10 place-content-center">
          <Icon className="h-4 w-4" />
        </motion.div>
        {!isCollapsed && (
          <motion.span
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.125 }}
            className="pr-3"
          >
            {item.label}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
}

interface TeamLinkProps {
  team: Team;
  isActive: boolean;
  isCollapsed: boolean;
}

function TeamLink({ team, isActive, isCollapsed }: TeamLinkProps) {
  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
      className={cn(
        'rounded-md overflow-hidden',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
      )}
      style={{ borderRadius: '6px' }}
    >
      <Link
        to={`/teams/${team.id}`}
        className="relative flex h-10 w-full items-center text-sm font-medium"
        title={isCollapsed ? team.name : undefined}
      >
        <motion.div layout className="grid h-full w-10 place-content-center">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: team.color }}
          />
        </motion.div>
        {!isCollapsed && (
          <motion.span
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.125 }}
            className="truncate pr-3"
          >
            {team.name}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
}

