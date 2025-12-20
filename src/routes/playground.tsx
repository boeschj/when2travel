import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Calendar,
  Check,
  X,
  Info,
  AlertTriangle,
  Loader2,
  MapPin,
  Bell,
  User,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { useState } from 'react'

export const Route = createFileRoute('/playground')({
  component: PlaygroundPage,
})

function PlaygroundPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [sliderValue, setSliderValue] = useState([50])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PlanTheTrip</span>
            </Link>
            <Badge variant="outline">Complete Component Library</Badge>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 space-y-20">
          {/* Table of Contents */}
          <section className="space-y-4">
            <h1 className="text-4xl font-black">Component Playground</h1>
            <p className="text-muted-foreground text-lg">
              Complete showcase of all UI components with every variant and state
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <a href="#typography" className="text-primary hover:underline">
                Typography
              </a>
              <a href="#colors" className="text-primary hover:underline">
                Colors
              </a>
              <a href="#buttons" className="text-primary hover:underline">
                Buttons
              </a>
              <a href="#inputs" className="text-primary hover:underline">
                Inputs
              </a>
              <a href="#badges" className="text-primary hover:underline">
                Badges
              </a>
              <a href="#cards" className="text-primary hover:underline">
                Cards
              </a>
              <a href="#avatars" className="text-primary hover:underline">
                Avatars
              </a>
              <a href="#alerts" className="text-primary hover:underline">
                Alerts
              </a>
              <a href="#switches" className="text-primary hover:underline">
                Switches
              </a>
              <a href="#checkboxes" className="text-primary hover:underline">
                Checkboxes
              </a>
              <a href="#sliders" className="text-primary hover:underline">
                Sliders
              </a>
              <a href="#progress" className="text-primary hover:underline">
                Progress
              </a>
              <a href="#tabs" className="text-primary hover:underline">
                Tabs
              </a>
              <a href="#dialogs" className="text-primary hover:underline">
                Dialogs
              </a>
              <a href="#sheets" className="text-primary hover:underline">
                Sheets
              </a>
              <a href="#popovers" className="text-primary hover:underline">
                Popovers
              </a>
              <a href="#tooltips" className="text-primary hover:underline">
                Tooltips
              </a>
              <a href="#accordion" className="text-primary hover:underline">
                Accordion
              </a>
              <a href="#calendar" className="text-primary hover:underline">
                Calendar
              </a>
              <a href="#skeleton" className="text-primary hover:underline">
                Skeleton
              </a>
              <a href="#toasts" className="text-primary hover:underline">
                Toasts
              </a>
            </div>
          </section>

          <Separator />

          {/* Typography */}
          <section className="space-y-8" id="typography">
            <div>
              <h2 className="text-3xl font-bold mb-2">Typography</h2>
              <p className="text-muted-foreground">Plus Jakarta Sans font family - all scales and weights</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Display / 6XL / Black</Label>
                <h1 className="text-6xl font-black tracking-tight">Travel Together</h1>
              </div>
              <div className="space-y-2">
                <Label>Heading 1 / 5XL / Bold</Label>
                <h2 className="text-5xl font-bold">Plan Your Next Trip</h2>
              </div>
              <div className="space-y-2">
                <Label>Heading 2 / 3XL / Bold</Label>
                <h3 className="text-3xl font-bold">Discover New Places</h3>
              </div>
              <div className="space-y-2">
                <Label>Heading 3 / 2XL / Semibold</Label>
                <h4 className="text-2xl font-semibold">Destination Details</h4>
              </div>
              <div className="space-y-2">
                <Label>Body Large / LG / Regular</Label>
                <p className="text-lg">
                  The quick brown fox jumps over the lazy dog. This is body large text for emphasis.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Body / Base / Regular</Label>
                <p className="text-base">
                  The quick brown fox jumps over the lazy dog. This is standard body text.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Small / SM / Medium</Label>
                <p className="text-sm font-medium text-muted-foreground">
                  The quick brown fox jumps over the lazy dog. This is small text.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Extra Small / XS / Medium</Label>
                <p className="text-xs font-medium text-muted-foreground">
                  The quick brown fox jumps over the lazy dog. This is extra small text.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Colors */}
          <section className="space-y-8" id="colors">
            <div>
              <h2 className="text-3xl font-bold mb-2">Color Palette</h2>
              <p className="text-muted-foreground">Complete brand color system</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="h-32 bg-primary rounded-2xl flex items-end p-4 shadow-lg">
                  <span className="text-primary-foreground font-bold">Primary</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono">#46ec13</p>
                  <p className="text-xs text-muted-foreground">Main actions, active states</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-32 bg-secondary rounded-2xl flex items-end p-4 shadow-lg">
                  <span className="text-secondary-foreground font-bold">Secondary</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono">#2e7d32</p>
                  <p className="text-xs text-muted-foreground">Secondary accents</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-32 bg-destructive rounded-2xl flex items-end p-4 shadow-lg">
                  <span className="text-destructive-foreground font-bold">Destructive</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono">#ef4444</p>
                  <p className="text-xs text-muted-foreground">Errors, warnings</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-32 bg-muted rounded-2xl flex items-end p-4 shadow-lg border border-border">
                  <span className="text-muted-foreground font-bold">Muted</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono">#1c2e18</p>
                  <p className="text-xs text-muted-foreground">Subtle backgrounds</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-32 bg-card border border-border rounded-2xl flex items-end p-4 shadow-lg">
                  <span className="text-card-foreground font-bold">Card</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono">#1c2e18</p>
                  <p className="text-xs text-muted-foreground">Card surfaces</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-32 bg-background border border-border rounded-2xl flex items-end p-4 shadow-lg">
                  <span className="text-foreground font-bold">Background</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono">#152211</p>
                  <p className="text-xs text-muted-foreground">Main background</p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Buttons */}
          <section className="space-y-8" id="buttons">
            <div>
              <h2 className="text-3xl font-bold mb-2">Buttons</h2>
              <p className="text-muted-foreground">All button variants and sizes</p>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Primary (Default)</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="icon-sm">
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button size="icon-lg">
                    <Check className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Default State</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </Button>
                  <Button>
                    <Check className="mr-2 h-4 w-4" />
                    With Icon
                  </Button>
                  <Button>
                    With Icon Right
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Inputs */}
          <section className="space-y-8" id="inputs">
            <div>
              <h2 className="text-3xl font-bold mb-2">Input Fields</h2>
              <p className="text-muted-foreground">Text inputs, textareas, and select dropdowns</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Default State</Label>
                  <Input type="text" placeholder="e.g. Paris, France" />
                  <p className="text-xs text-muted-foreground">Standard input with placeholder</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary">Focus State (with icon)</Label>
                  <Input
                    type="text"
                    value="Tokyo, Japan"
                    icon={<MapPin className="h-4 w-4 text-primary" />}
                  />
                  <p className="text-xs text-muted-foreground">Input with custom icon</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-destructive">Error State</Label>
                  <Input
                    type="text"
                    value="Invalid Date!!"
                    state="error"
                    helperText="Please enter a valid departure date."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary">Success/Confirmation State</Label>
                  <Input
                    type="text"
                    value="group_trip_v2"
                    state="success"
                    helperText="Trip name is available!"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Disabled Input</Label>
                  <Input disabled value="Cannot edit this field" />
                  <p className="text-xs text-muted-foreground">Disabled with cursor-not-allowed</p>
                </div>
                <div className="space-y-2">
                  <Label>Textarea</Label>
                  <Textarea placeholder="Type your message here..." rows={4} />
                  <p className="text-xs text-muted-foreground">Multi-line text input</p>
                </div>
                <div className="space-y-2">
                  <Label>Select Dropdown</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Dropdown with options</p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Badges */}
          <section className="space-y-8" id="badges">
            <div>
              <h2 className="text-3xl font-bold mb-2">Badges</h2>
              <p className="text-muted-foreground">Status indicators and labels</p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default (Primary)</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>
                    <Check className="mr-1 h-3 w-3" />
                    Confirmed
                  </Badge>
                  <Badge variant="destructive">
                    <X className="mr-1 h-3 w-3" />
                    Cancelled
                  </Badge>
                  <Badge variant="outline">
                    <Bell className="mr-1 h-3 w-3" />
                    Notifications
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>New</Badge>
                  <Badge variant="secondary">Beta</Badge>
                  <Badge variant="outline">v1.0</Badge>
                  <Badge>5/10 Responses</Badge>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Cards */}
          <section className="space-y-8" id="cards">
            <div>
              <h2 className="text-3xl font-bold mb-2">Cards</h2>
              <p className="text-muted-foreground">Content containers with various compositions</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                  <CardDescription>Basic card with header and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    This is a simple card component with a header and content section.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Footer</CardTitle>
                  <CardDescription>Card with action buttons</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">This card includes a footer with action buttons.</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm">Accept</Button>
                  <Button size="sm" variant="outline">
                    Decline
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      JD
                    </Avatar>
                    <div>
                      <CardTitle>With Avatar</CardTitle>
                      <CardDescription>john@example.com</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Card combining avatar with content.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Avatars */}
          <section className="space-y-8" id="avatars">
            <div>
              <h2 className="text-3xl font-bold mb-2">Avatars</h2>
              <p className="text-muted-foreground">User profile representations</p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    XS
                  </Avatar>
                  <Avatar className="h-10 w-10 bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                    SM
                  </Avatar>
                  <Avatar className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    MD
                  </Avatar>
                  <Avatar className="h-16 w-16 bg-secondary text-secondary-foreground flex items-center justify-center text-lg font-bold">
                    LG
                  </Avatar>
                  <Avatar className="h-20 w-20 bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    XL
                  </Avatar>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Initials Examples</h3>
                <div className="flex flex-wrap gap-3">
                  <Avatar className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    AB
                  </Avatar>
                  <Avatar className="h-12 w-12 bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    CD
                  </Avatar>
                  <Avatar className="h-12 w-12 bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
                    EF
                  </Avatar>
                  <Avatar className="h-12 w-12 bg-muted text-muted-foreground flex items-center justify-center font-bold border border-border">
                    GH
                  </Avatar>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Avatar Group</h3>
                <div className="flex -space-x-2">
                  <Avatar className="h-10 w-10 bg-purple-500 text-white flex items-center justify-center font-bold border-2 border-background">
                    JS
                  </Avatar>
                  <Avatar className="h-10 w-10 bg-blue-500 text-white flex items-center justify-center font-bold border-2 border-background">
                    AK
                  </Avatar>
                  <Avatar className="h-10 w-10 bg-orange-500 text-white flex items-center justify-center font-bold border-2 border-background">
                    MR
                  </Avatar>
                  <Avatar className="h-10 w-10 bg-muted text-foreground flex items-center justify-center text-xs font-bold border-2 border-background">
                    +5
                  </Avatar>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Alerts */}
          <section className="space-y-8" id="alerts">
            <div>
              <h2 className="text-3xl font-bold mb-2">Alerts</h2>
              <p className="text-muted-foreground">Contextual feedback messages</p>
            </div>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>
                  This is an informational message about your trip planning.
                </AlertDescription>
              </Alert>

              <Alert variant="success">
                <Check className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Your trip has been created successfully. Share the link with your group.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was an error processing your request. Please try again later.
                </AlertDescription>
              </Alert>

              <Alert>
                <Bell className="h-4 w-4" />
                <AlertTitle>Without Description</AlertTitle>
              </Alert>
            </div>
          </section>

          <Separator />

          {/* Form Controls */}
          <section className="space-y-8" id="switches">
            <div>
              <h2 className="text-3xl font-bold mb-2">Switches</h2>
              <p className="text-muted-foreground">Toggle switches for binary options</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Switch id="switch-1" />
                <Label htmlFor="switch-1">Off State</Label>
              </div>
              <div className="flex items-center gap-4">
                <Switch id="switch-2" defaultChecked />
                <Label htmlFor="switch-2">On State (Default Checked)</Label>
              </div>
              <div className="flex items-center gap-4">
                <Switch id="switch-3" disabled />
                <Label htmlFor="switch-3" className="text-muted-foreground">
                  Disabled Off
                </Label>
              </div>
              <div className="flex items-center gap-4">
                <Switch id="switch-4" disabled defaultChecked />
                <Label htmlFor="switch-4" className="text-muted-foreground">
                  Disabled On
                </Label>
              </div>
              <Card className="p-6 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your trips
                      </p>
                    </div>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync">Sync Calendar</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync with your calendar
                      </p>
                    </div>
                    <Switch id="sync" />
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Checkboxes */}
          <section className="space-y-8" id="checkboxes">
            <div>
              <h2 className="text-3xl font-bold mb-2">Checkboxes</h2>
              <p className="text-muted-foreground">Selection controls for multiple choices</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Checkbox id="checkbox-1" />
                <Label htmlFor="checkbox-1">Unchecked</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="checkbox-2" defaultChecked />
                <Label htmlFor="checkbox-2">Checked</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="checkbox-3" disabled />
                <Label htmlFor="checkbox-3" className="text-muted-foreground">
                  Disabled Unchecked
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="checkbox-4" disabled defaultChecked />
                <Label htmlFor="checkbox-4" className="text-muted-foreground">
                  Disabled Checked
                </Label>
              </div>
              <Card className="p-6 max-w-md">
                <div className="space-y-3">
                  <h3 className="font-semibold">Trip Preferences</h3>
                  <div className="flex items-center gap-3">
                    <Checkbox id="beach" defaultChecked />
                    <Label htmlFor="beach">Beach destinations</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="mountains" defaultChecked />
                    <Label htmlFor="mountains">Mountain getaways</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="cities" />
                    <Label htmlFor="cities">City tours</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="adventure" />
                    <Label htmlFor="adventure">Adventure sports</Label>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Sliders */}
          <section className="space-y-8" id="sliders">
            <div>
              <h2 className="text-3xl font-bold mb-2">Sliders</h2>
              <p className="text-muted-foreground">Range input controls</p>
            </div>
            <div className="space-y-8 max-w-md">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Default Slider</Label>
                  <span className="text-sm font-mono text-primary">{sliderValue[0]}%</span>
                </div>
                <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Budget Range</Label>
                  <span className="text-sm font-mono text-primary">$2,500</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={5} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Trip Duration (days)</Label>
                  <span className="text-sm font-mono text-primary">7</span>
                </div>
                <Slider defaultValue={[7]} max={30} step={1} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-muted-foreground">Disabled</Label>
                  <span className="text-sm font-mono text-muted-foreground">75%</span>
                </div>
                <Slider defaultValue={[75]} disabled />
              </div>
            </div>
          </section>

          <Separator />

          {/* Progress */}
          <section className="space-y-8" id="progress">
            <div>
              <h2 className="text-3xl font-bold mb-2">Progress Bars</h2>
              <p className="text-muted-foreground">Visual progress indicators</p>
            </div>
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Responses Collected</span>
                  <span className="text-muted-foreground">3/10</span>
                </div>
                <Progress value={30} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span className="text-muted-foreground">50%</span>
                </div>
                <Progress value={50} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trip Planning Complete</span>
                  <span className="text-muted-foreground">75%</span>
                </div>
                <Progress value={75} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>All Done!</span>
                  <span className="text-primary font-semibold">100%</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Tabs */}
          <section className="space-y-8" id="tabs">
            <div>
              <h2 className="text-3xl font-bold mb-2">Tabs</h2>
              <p className="text-muted-foreground">Organize content into categories</p>
            </div>
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overview Content</CardTitle>
                      <CardDescription>This is the overview tab</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This content is shown when the Overview tab is active.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics Content</CardTitle>
                      <CardDescription>View your trip analytics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Analytics data and charts would appear here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reports">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reports Content</CardTitle>
                      <CardDescription>Generate and view reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Report generation tools would be displayed here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  <TabsTrigger value="tab4">Tab 4</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </section>

          <Separator />

          {/* Dialogs */}
          <section className="space-y-8" id="dialogs">
            <div>
              <h2 className="text-3xl font-bold mb-2">Dialogs (Modals)</h2>
              <p className="text-muted-foreground">Modal windows for focused interactions</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Simple Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Simple Dialog</DialogTitle>
                    <DialogDescription>
                      This is a basic dialog with a title and description.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm">
                    Dialogs are modal windows that require user interaction before continuing.
                  </p>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">With Actions</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this trip? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Form Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Trip Name</DialogTitle>
                    <DialogDescription>
                      Make changes to your trip details here.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Trip Name</Label>
                      <Input id="name" placeholder="e.g. Summer 2024" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description</Label>
                      <Textarea id="desc" placeholder="Trip description..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          <Separator />

          {/* Sheets */}
          <section className="space-y-8" id="sheets">
            <div>
              <h2 className="text-3xl font-bold mb-2">Sheets (Side Panels)</h2>
              <p className="text-muted-foreground">Slide-in panels from screen edges</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet (Right)</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Trip Details</SheetTitle>
                    <SheetDescription>View and edit trip information</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Trip Name</Label>
                      <Input placeholder="Enter trip name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Input placeholder="Where are you going?" />
                    </div>
                    <Button className="w-full">Save Changes</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Settings Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>Manage your preferences</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notifications</Label>
                        <p className="text-sm text-muted-foreground">Email updates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Theme preference</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </section>

          <Separator />

          {/* Popovers */}
          <section className="space-y-8" id="popovers">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popovers</h2>
              <p className="text-muted-foreground">Contextual floating panels</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Trip Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Popovers display additional context and actions.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        JD
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">John Doe</h4>
                        <p className="text-sm text-muted-foreground">john@example.com</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <X className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Date Picker Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>
          </section>

          <Separator />

          {/* Tooltips */}
          <section className="space-y-8" id="tooltips">
            <div>
              <h2 className="text-3xl font-bold mb-2">Tooltips</h2>
              <p className="text-muted-foreground">Helpful hints on hover</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a helpful tooltip message</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Additional information appears here</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">8/10 Available</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">Participants</p>
                    <p className="text-xs">8 people are available on this date</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          <Separator />

          {/* Accordion */}
          <section className="space-y-8" id="accordion">
            <div>
              <h2 className="text-3xl font-bold mb-2">Accordion</h2>
              <p className="text-muted-foreground">Collapsible content sections</p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Single Item Open</h3>
                <Accordion type="single" collapsible className="w-full max-w-2xl">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is PlanTheTrip free to use?</AccordionTrigger>
                    <AccordionContent>
                      Yes, PlanTheTrip is completely free to use. No account needed, no hidden fees.
                      Simply create a trip, share the link, and start coordinating!
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How many people can participate?</AccordionTrigger>
                    <AccordionContent>
                      There's no limit on the number of participants. Whether you're planning with 5
                      friends or 50, PlanTheTrip can handle it. The more people, the better the
                      coordination!
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Can I edit my availability later?</AccordionTrigger>
                    <AccordionContent>
                      Absolutely! After submitting your availability, you'll receive a unique edit
                      link. Save this link to make changes to your dates anytime before the trip is
                      finalized.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How does the date matching work?</AccordionTrigger>
                    <AccordionContent>
                      Our algorithm analyzes everyone's availability and highlights dates where the
                      most people are free. The heatmap shows darker green for better matches, making
                      it easy to see the best options at a glance.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Multiple Items Open</h3>
                <Accordion type="multiple" className="w-full max-w-2xl">
                  <AccordionItem value="feature-1">
                    <AccordionTrigger>Feature 1: Easy Sharing</AccordionTrigger>
                    <AccordionContent>
                      Share trip planning links with one click. No signups required for participants.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="feature-2">
                    <AccordionTrigger>Feature 2: Smart Matching</AccordionTrigger>
                    <AccordionContent>
                      Our algorithm finds the best dates when everyone is available.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="feature-3">
                    <AccordionTrigger>Feature 3: Visual Heatmap</AccordionTrigger>
                    <AccordionContent>
                      See availability at a glance with our color-coded calendar heatmap.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </section>

          <Separator />

          {/* Calendar */}
          <section className="space-y-8" id="calendar">
            <div>
              <h2 className="text-3xl font-bold mb-2">Calendar</h2>
              <p className="text-muted-foreground">Date picker component</p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Single Date Selection</h3>
                <Card className="p-6 inline-block">
                  <CalendarComponent mode="single" selected={date} onSelect={setDate} />
                </Card>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Range Selection</h3>
                <Card className="p-6 inline-block">
                  <CalendarComponent mode="range" numberOfMonths={2} />
                </Card>
              </div>
            </div>
          </section>

          <Separator />

          {/* Skeleton */}
          <section className="space-y-8" id="skeleton">
            <div>
              <h2 className="text-3xl font-bold mb-2">Skeleton Loaders</h2>
              <p className="text-muted-foreground">Loading state placeholders</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="pt-4">
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <Separator />

          {/* Toasts */}
          <section className="space-y-8" id="toasts">
            <div>
              <h2 className="text-3xl font-bold mb-2">Toast Notifications</h2>
              <p className="text-muted-foreground">Temporary notification messages (Sonner)</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => toast('Default toast notification')}>Default Toast</Button>
                <Button
                  onClick={() =>
                    toast.success('Trip created successfully!', {
                      description: 'Share the link with your group.',
                    })
                  }
                >
                  Success Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    toast.error('Failed to save changes', {
                      description: 'Please try again later.',
                    })
                  }
                >
                  Error Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast('Are you sure?', {
                      description: 'This action cannot be undone.',
                      action: {
                        label: 'Confirm',
                        onClick: () => toast.success('Confirmed!'),
                      },
                    })
                  }
                >
                  Toast with Action
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast('Event Reminder', {
                      description: 'Trip to Japan starts in 5 days',
                      icon: <Bell className="h-4 w-4" />,
                    })
                  }
                >
                  Toast with Icon
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const promise = new Promise((resolve) =>
                      setTimeout(() => resolve({ name: 'Japan Trip' }), 2000)
                    )
                    toast.promise(promise, {
                      loading: 'Creating trip...',
                      success: 'Trip created!',
                      error: 'Failed to create trip',
                    })
                  }}
                >
                  Promise Toast
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Click buttons above to see toast notifications in action
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-20 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Complete Component Library • PlanTheTrip Design System
              </p>
              <div className="flex justify-center gap-6">
                <Link to="/" className="text-primary hover:underline text-sm">
                  ← Back to Home
                </Link>
                <a href="#typography" className="text-muted-foreground hover:text-primary text-sm">
                  Back to Top ↑
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}
