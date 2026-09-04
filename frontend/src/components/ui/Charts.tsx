import { ReactNode } from 'react';
import { cn } from '../../utils/helpers';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Card, CardContent } from './Card';

const CHART_COLORS = ['#22D3EE', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7', '#EC4899', '#14B8A6'];

interface ChartContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  height?: number;
}

export function ChartContainer({ children, title, description, action, className, height = 300 }: ChartContainerProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {(title || description || action) && (
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-heading font-semibold text-cyber-text">{title}</h3>}
            {description && <p className="text-sm text-cyber-textMuted mt-1">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <CardContent className="p-0">
        <div style={{ height }}>{children}</div>
      </CardContent>
    </Card>
  );
}

interface AreaChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: Array<{ key: string; name: string; color?: string }>;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  curveType?: 'linear' | 'monotone' | 'step' | 'natural' | 'basis';
  fillOpacity?: number;
}

export function AreaChartComponent({ data, xKey, series, height = 300, showGrid = true, showTooltip = true, curveType = 'monotone', fillOpacity = 0.3 }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />}
        <XAxis
          dataKey={xKey}
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => String(value)}
        />
        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
        {showTooltip && <Tooltip contentStyle={{ backgroundColor: '#0B0F17', border: '1px solid #1F2937', borderRadius: '8px' }} />}
        <Legend />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type={curveType}
            dataKey={s.key}
            name={s.name}
            stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]}
            fill={s.color || CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={fillOpacity}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: Array<{ key: string; name: string; color?: string }>;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
}

export function BarChartComponent({ data, xKey, series, height = 300, showGrid = true, showTooltip = true, layout = 'horizontal', stacked = false }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={layout === 'horizontal'} horizontal={layout === 'vertical'} />}
        {layout === 'horizontal' ? (
          <>
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <YAxis dataKey={xKey} type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} width={80} />
            <XAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
          </>
        )}
        {showTooltip && <Tooltip contentStyle={{ backgroundColor: '#0B0F17', border: '1px solid #1F2937', borderRadius: '8px' }} />}
        <Legend />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color || CHART_COLORS[i % CHART_COLORS.length]}
            radius={4}
            stackId={stacked ? 'a' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: Array<{ key: string; name: string; color?: string; dash?: boolean }>;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  curveType?: 'linear' | 'monotone' | 'step' | 'natural' | 'basis';
}

export function LineChartComponent({ data, xKey, series, height = 300, showGrid = true, showTooltip = true, curveType = 'monotone' }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />}
        <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
        {showTooltip && <Tooltip contentStyle={{ backgroundColor: '#0B0F17', border: '1px solid #1F2937', borderRadius: '8px' }} />}
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type={curveType}
            dataKey={s.key}
            name={s.name}
            stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            strokeDasharray={s.dash ? '5 5' : undefined}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

export function PieChartComponent({ data, height = 300, innerRadius = 60, outerRadius = 100, showTooltip = true, showLegend = true, colors = CHART_COLORS }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        {showTooltip && <Tooltip contentStyle={{ backgroundColor: '#0B0F17', border: '1px solid #1F2937', borderRadius: '8px' }} />}
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

interface RadialBarChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  colors?: string[];
}

export function RadialBarChartComponent({ data, height = 250, colors = CHART_COLORS }: RadialBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart>
        <RadialBar
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          dataKey="value"
          nameKey="name"
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
          ))}
        </RadialBar>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; up: boolean };
  color?: 'primary' | 'success' | 'warning' | 'critical' | 'secondary';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  subValue?: string;
  subLabel?: string;
}

const metricColorClasses = {
  primary: 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary/20',
  success: 'bg-cyber-success/10 text-cyber-success border-cyber-success/20',
  warning: 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20',
  critical: 'bg-cyber-critical/10 text-cyber-critical border-cyber-critical/20',
  secondary: 'bg-cyber-secondary/10 text-cyber-secondary border-cyber-secondary/20',
};

const metricIconBgClasses = {
  primary: 'bg-cyber-primary/10 text-cyber-primary',
  success: 'bg-cyber-success/10 text-cyber-success',
  warning: 'bg-cyber-warning/10 text-cyber-warning',
  critical: 'bg-cyber-critical/10 text-cyber-critical',
  secondary: 'bg-cyber-secondary/10 text-cyber-secondary',
};

export function MetricCard({ label, value, icon, trend, color = 'primary', loading, onClick, className, subValue, subLabel }: MetricCardProps) {
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse bg-cyber-elevated rounded', className)} />
  );

  if (loading) {
    return (
      <Card className={cn('cursor-pointer', className)} variant="hover">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300',
        onClick && 'hover:shadow-elevated hover:border-cyber-primary/30 hover:-translate-y-0.5',
        className
      )}
      variant={onClick ? 'hover' : 'default'}
      onClick={onClick}
      padding="md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className={cn('p-3 rounded-lg flex-shrink-0', metricIconBgClasses[color])}>
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyber-textMuted truncate">{label}</p>
            <p className="text-2xl font-heading font-bold text-cyber-text truncate">{value}</p>
            {subValue && subLabel && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-cyber-text">{subValue}</span>
                <span className="text-xs text-cyber-textMuted">{subLabel}</span>
              </div>
            )}
          </div>
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
              trend.up
                ? 'bg-cyber-success/10 text-cyber-success'
                : 'bg-cyber-critical/10 text-cyber-critical'
            )}
          >
            <span className="flex items-center gap-0.5">
              {trend.up ? '▲' : '▼'}
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({ data, color = '#22D3EE', width = 100, height = 40, showArea = true, className }: SparklineProps) {
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - (value / Math.max(...data)) * height * 0.8,
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L${width} ${height} L0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn('overflow-visible', className)}>
      {showArea && (
        <path d={areaPath} fill={color} fillOpacity="0.1" stroke="none" />
      )}
      <path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={color}
          stroke="#0B0F17"
          strokeWidth={2}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      ))}
    </svg>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressRing({ value, max = 100, size = 60, strokeWidth = 4, color = '#22D3EE', backgroundColor = '#1F2937', showValue = true, className }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, value / max));
  const offset = circumference * (1 - progress);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-bold text-cyber-text">{Math.round(progress * 100)}%</span>
        </div>
      )}
    </div>
  );
}

export function StatGrid({ children, columns = 6, className }: { children: ReactNode; columns?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4', className)}>
      {children}
    </div>
  );
}