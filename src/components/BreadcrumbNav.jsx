import '../css/BreadcrumbNav.css';

function BreadcrumbNav({ items = [] }) {
  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.href ? (
              <a href={item.href} className="breadcrumb-link">
                {item.label}
              </a>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && <span className="breadcrumb-sep">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default BreadcrumbNav;
