import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Layout, Database, Zap, Plug, BarChart3, 
  ArrowRight, CheckCircle, Menu, X, Settings,
  Layers, RefreshCw, Shield
} from 'lucide-react'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 1000,
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={24} color="white" />
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              NEXORA
            </span>
          </div>

          {/* Desktop Navigation */}
          <div style={{ 
            display: window.innerWidth >= 768 ? 'flex' : 'none',
            alignItems: 'center',
            gap: '24px'
          }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: 700 }}>Dashboard</Link>
            <Link to="/products" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Catalog</Link>
            <Link to="/customers" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Customers</Link>
            <Link to="/analytics" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Analytics</Link>
            <a href="#features" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Features</a>
            <Link to="/login" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Login</Link>
            <Link 
              to="/dashboard"
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              display: window.innerWidth < 768 ? 'block' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            padding: '24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <a href="#features" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Features</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>How It Works</a>
            <a href="#integrations" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Integrations</a>
            <Link to="/login" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>Login</Link>
            <Link to="/signup" style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '120px 24px 80px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #f8fafc 0%, #e0e7ff 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #1e293b, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Your Business Data.<br />One Intelligent Platform.
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '40px',
            lineHeight: 1.6
          }}>
            Build custom data resources, manage records, automate workflows, and connect your business tools with NEXORA.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/dashboard"
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Launch Live Workspace <ArrowRight size={18} />
            </Link>
            <Link 
              to="/products"
              style={{
                padding: '14px 28px',
                background: 'white',
                color: '#4f46e5',
                border: '1.5px solid #e0e7ff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Browse Catalog
            </Link>
            <a 
              href="#features"
              style={{
                padding: '14px 28px',
                background: '#f8fafc',
                color: '#64748b',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
            >
              Explore Features
            </a>
          </div>

          {/* Dashboard Preview */}
          <div style={{
            marginTop: '60px',
            background: 'white',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            maxWidth: '900px',
            margin: '60px auto 0'
          }}>
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '40px',
              color: 'white',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <Database size={64} color="#3b82f6" />
              <p style={{ fontSize: '18px', color: '#94a3b8' }}>Interactive Dashboard Preview</p>
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>5+</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Resources</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>10+</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Integrations</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>100%</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Sync Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
              Everything You Need to Manage Business Data
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b' }}>
              Powerful features designed for modern data orchestration
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            {[
              {
                icon: <Layout size={32} color="#3b82f6" />,
                title: 'Custom Resource Builder',
                description: 'Define schemas and fields without rebuilding your application. Create custom data structures that match your business needs.'
              },
              {
                icon: <Database size={32} color="#8b5cf6" />,
                title: 'Centralized Record Management',
                description: 'Organize, search, filter, and manage business records in one unified platform with powerful querying capabilities.'
              },
              {
                icon: <Zap size={32} color="#f59e0b" />,
                title: 'Workflow Automation',
                description: 'Configure lifecycle states and transitions. Automate business processes with customizable workflow rules.'
              },
              {
                icon: <Plug size={32} color="#10b981" />,
                title: 'Third-Party Integrations',
                description: 'Connect external services like WooCommerce. Map fields and sync data seamlessly between systems.'
              },
              {
                icon: <RefreshCw size={32} color="#ec4899" />,
                title: 'Synchronization Monitoring',
                description: 'Inspect sync results, statuses, and logs. Track data flows and resolve issues with detailed monitoring.'
              },
              {
                icon: <BarChart3 size={32} color="#06b6d4" />,
                title: 'Dashboard Analytics',
                description: 'Monitor resources, records, successful syncs, and active integrations with real-time analytics.'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                padding: '32px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b' }}>
              Get started in three simple steps
            </p>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              {
                step: '01',
                title: 'Create a Resource',
                description: 'Define your custom schema with fields, validation rules, and data types.'
              },
              {
                step: '02',
                title: 'Add Records',
                description: 'Populate your resource with data and configure workflows for automation.'
              },
              {
                step: '03',
                title: 'Connect & Monitor',
                description: 'Integrate external services and monitor synchronization in real-time.'
              }
            ].map((step, i) => (
              <div key={i} style={{ flex: 1, minWidth: '280px', textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 auto 20px'
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
              Powerful Integrations
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b' }}>
              Connect your favorite tools and services
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px' 
          }}>
            {[
              { name: 'WooCommerce', status: 'Available', color: '#10b981' },
              { name: 'Shopify', status: 'Coming Soon', color: '#f59e0b' },
              { name: 'Salesforce', status: 'Coming Soon', color: '#f59e0b' },
              { name: 'Custom API', status: 'Available', color: '#10b981' }
            ].map((integration, i) => (
              <div key={i} style={{
                padding: '24px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <Plug size={24} color="#64748b" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{integration.name}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: integration.color,
                    fontWeight: 500
                  }}>
                    {integration.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 24px', background: '#1e293b', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
              Why Choose NEXORA?
            </h2>
            <p style={{ fontSize: '18px', color: '#94a3b8' }}>
              Benefits that transform your data management
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '32px' 
          }}>
            {[
              'Reduced manual data management',
              'Consistent data structures across systems',
              'Centralized visibility and control',
              'Easier integration management'
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={24} color="#10b981" />
                <span style={{ fontSize: '16px' }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
            Ready to Organize Your Business Data?
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
            Join thousands of businesses already using NEXORA
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/signup"
              style={{
                padding: '14px 32px',
                background: 'white',
                color: '#3b82f6',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Create Your Account
            </Link>
            <Link 
              to="/login"
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: 'white',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
                border: '2px solid white',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 24px', background: '#1e293b', color: '#94a3b8', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Database size={18} color="white" />
              </div>
              <span style={{ fontWeight: 600, color: 'white' }}>NEXORA</span>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <a href="#features" style={{ textDecoration: 'none', color: '#94a3b8' }}>Features</a>
              <a href="#how-it-works" style={{ textDecoration: 'none', color: '#94a3b8' }}>About</a>
              <Link to="/login" style={{ textDecoration: 'none', color: '#94a3b8' }}>Login</Link>
              <Link to="/signup" style={{ textDecoration: 'none', color: '#94a3b8' }}>Signup</Link>
            </div>
          </div>

          <div style={{ 
            marginTop: '32px', 
            paddingTop: '24px', 
            borderTop: '1px solid #334155',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            © 2024 NEXORA. All rights reserved. | <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
