export const getVisiblePages = (currentPage, totalPages) => {
    // Показываем 1 страницу назад и 2 страницы вперед от текущей
    let startPage = Math.max(1, currentPage - 1);

    console.log(totalPages, currentPage)
    let endPage = Math.min(totalPages, currentPage + 1);
    console.log(endPage)
    
    // Создаем массив видимых страниц
    const visiblePages = [];
    
    // Добавляем первую страницу и многоточие, если нужно
    if (startPage > 1) {
      visiblePages.push(1);
      if (startPage > 2) {
        visiblePages.push('...');
      }
    }
    
    // Добавляем основные страницы (1 назад, текущая, 2 вперед)
    for (let i = startPage; i <= endPage; i++) {
        console.log('PUSH', i)
        visiblePages.push(i);
    }
    
    // Добавляем многоточие и последнюю страницу, если нужно
    console.log('END', endPage, 'total', totalPages)
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        visiblePages.push('...');
      }
      visiblePages.push(totalPages);
    }
    
    return visiblePages;
  };
