// Part 1 Data Fetching Functions
function fetchUserProfile(userId, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Unable to load user profile'));
        return;
      }

      const user = {
        id: userId,
        name: 'Misha Azaranka',
        email: 'misha.azaranka@gmail.com',
        username: 'mazaranka'
      };

      resolve(user);
    }, 1000);
  });
}




function fetchUserPosts(userId, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Unable to load posts'));
        return;
      }

      const posts = [
        { postId: 1, userId, title: '1st Post', content: 'Basic Programming' },
        { postId: 2, userId, title: '2nd Post', content: 'Unity vs Unreal' },
        { postId: 3, userId, title: '3rd Post', content: 'Does Pineapple belong on a pizza? (Serious Question)' }
      ];

      resolve(posts);
    }, 1500);
  });
}




function fetchPostComments(postId, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`Could not load comments for post ${postId}`));
        return;
      }

      const comments = [
        { commentId: 1, postId, username: 'Mike123', comment: 'Awesome post' },
        { commentId: 2, postId, username: 'KiP', comment: 'meh' },
        { commentId: 3, postId, username: 'metro2033', comment: 'Nah' }
      ];

      resolve(comments);
    }, 2000);
  });
}



// Part 2 Sequential vs Parallel Fetching
async function fetchDataSequentially(userId) {
  console.log('Getting sequential fetch');
  const startTime = Date.now();

  try {
    const user = await fetchUserProfile(userId);
    console.log('User profile found');

    const posts = await fetchUserPosts(userId);
    console.log('Posts found');

    for (const post of posts) {
      try {
        const comments = await fetchPostComments(post.postId);
        console.log(`Comments retrieved for post ${post.postId}`);
        post.comments = comments;
      } catch (error) {
        console.warn(`Failed to fetch comments for post ${post.postId}:`, error.message);
        post.comments = [];
      }
    }

    const endTime = Date.now();
    console.log(`Sequential fetch took ${endTime - startTime}ms`);

    return { user, posts };
  } catch (error) {
    console.error('Error in sequential fetch', error.message);
  }
}

async function fetchDataInParallel(userId) {
  console.log('Starting parallel fetch');
  const startTime = Date.now();

  try {
    const [user, posts] = await Promise.all([
      fetchUserProfile(userId),
      fetchUserPosts(userId)
    ]);

    console.log('User and posts retrieved simultaneously');

    const commentPromises = posts.map(post =>
      fetchPostComments(post.postId)
        .then(comments => ({ post, comments }))
        .catch(error => {
          console.warn(`Failed fetching comments for post ${post.postId}:`, error.message);
          return { post, comments: [] };
        })
    );

    const combined = await Promise.all(commentPromises);

    const endTime = Date.now();
    console.log(`Parallel fetch took ${endTime - startTime}ms`);

    return { user, posts: combined.map(item => ({ ...item.post, comments: item.comments })) };
  } catch (error) {
    console.error('Error in parallel fetch', error.message);
  }
}

// Part 3 Error Handling
async function fetchDataWithErrorHandling(userId) {
  try {
    const data = await fetchDataSequentially(userId);
    return data;
  } catch (error) {
    console.error('Fetch failed', error.message);
    return { user: null, posts: [] };
  }
}



// Part 4 Master Function
async function getUserContent(userId) {
  console.log('Fetching users content');

  try {
    
    const user = await fetchUserProfile(userId);
    console.log('Step 1: User profile retrieved', user.name);

    
    const posts = await fetchUserPosts(userId);
    console.log('Step 2: Posts retrieved', posts.length);

    
    const commentPromises = posts.map(post =>
      fetchPostComments(post.postId)
        .then(comments => ({ post, comments }))
        .catch(error => {
          console.warn(`Failed to fetch comments for post ${post.postId}:`, error.message);
          return { post, comments: [] };
        })
    );

    const combined = await Promise.all(commentPromises);
    console.log('Step 3: Comments retrieved');

    
    const allContent = {
      user,
      posts: combined.map(item => ({ ...item.post, comments: item.comments }))
    };

    return allContent;
  } catch (error) {
    console.error('Failed to fetch user content:', error.message);
    throw error;
  }
}



// Part 5 Button Integration
document.getElementById('sequentialBtn').addEventListener('click', async () => {
  const container = document.getElementById('result');
  container.innerHTML = '<p>Loading sequential data</p>';
  const data = await fetchDataSequentially(1);
  displayResults(data, container);
});

document.getElementById('parallelBtn').addEventListener('click', async () => {
  const container = document.getElementById('result');
  container.innerHTML = '<p>Loading parallel data</p>';
  const data = await fetchDataInParallel(1);
  displayResults(data, container);
});


// Part 6 Format the Output
function displayResults(data, container) {
  container.innerHTML = '';

  if (!data || !data.user) {
    container.innerHTML = '<p class="error">Unable to load user data</p>';
    return;
  }

  const userDiv = document.createElement('div');
  userDiv.innerHTML = `
    <h2>${data.user.name}</h2>
    <p><strong>Username:</strong> ${data.user.username}</p>
    <p><strong>Email:</strong> ${data.user.email}</p>
  `;
  container.appendChild(userDiv);

  data.posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <h4>Comments:</h4>
    `;

    const commentList = document.createElement('ul');
    post.comments.forEach(comment => {
      const li = document.createElement('li');
      li.textContent = `${comment.username}: ${comment.comment}`;
      commentList.appendChild(li);
    });

    postDiv.appendChild(commentList);
    container.appendChild(postDiv);
  });
}
