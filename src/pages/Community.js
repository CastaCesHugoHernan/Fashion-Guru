// src/pages/Community.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import './Estilos/Community.css'; // Importar el archivo CSS para los estilos

function Community() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [commentContent, setCommentContent] = useState({}); // Guardar comentarios por publicación
  const [reactions, setReactions] = useState({}); // Guardar reacciones por publicación
  const [userReactions, setUserReactions] = useState({}); // Guardar la reacción del usuario para cada publicación

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          created_at,
          comments (id, user_id, content, created_at),
          users (name) /* Ahora traemos el nombre del usuario */
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setMessage(`Error al cargar publicaciones: ${error.message}`);
      } else {
        setPosts(postsData);
      }
    };

    const fetchReactions = async () => {
      const userId = localStorage.getItem('user_id');

      const { data: reactionsData, error } = await supabase
        .from('reactions')
        .select('post_id, type, user_id');

      if (error) {
        console.error('Error al cargar reacciones:', error.message);
      } else {
        const reactionsByPost = {};
        const userReactionsByPost = {};

        reactionsData.forEach((reaction) => {
          if (!reactionsByPost[reaction.post_id]) {
            reactionsByPost[reaction.post_id] = { like: 0, love: 0 };
          }

          reactionsByPost[reaction.post_id][reaction.type] += 1;

          if (reaction.user_id === userId) {
            userReactionsByPost[reaction.post_id] = reaction.type;
          }
        });

        setReactions(reactionsByPost);
        setUserReactions(userReactionsByPost); // Guardar las reacciones del usuario
      }
    };

    fetchPosts();
    fetchReactions();
  }, []);

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('community-media')
      .upload(filePath, file);

    if (error) {
      setMessage(`Error al subir archivo: ${error.message}`);
      return null;
    }

    const { data: publicURLData } = await supabase.storage
      .from('community-media')
      .getPublicUrl(filePath);

    return publicURLData?.publicUrl || null;
  };

  const handleAddPost = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setMessage('Error: No se encontró el ID del usuario');
      return;
    }

    let imageUrl = null;
    if (file) {
      imageUrl = await uploadFile(file);
    }

    const { error } = await supabase
      .from('posts')
      .insert([{ user_id: userId, content, image_url: imageUrl }]);

    if (error) {
      setMessage(`Error al añadir publicación: ${error.message}`);
    } else {
      setMessage('Publicación añadida exitosamente');
      setContent('');
      setFile(null);
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          created_at,
          comments (id, user_id, content, created_at),
          users (name)
        `)
        .order('created_at', { ascending: false });
      setPosts(data);
    }
  };

  const handleAddComment = async (postId) => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setMessage('Error: No se encontró el ID del usuario');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: userId, content: commentContent[postId] }]);

    if (error) {
      setMessage(`Error al añadir comentario: ${error.message}`);
    } else {
      setMessage('Comentario añadido exitosamente');
      setCommentContent({ ...commentContent, [postId]: '' });
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          created_at,
          comments (id, user_id, content, created_at),
          users (name)
        `)
        .order('created_at', { ascending: false });
      setPosts(data);
    }
  };

  const handleReaction = async (postId, type) => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setMessage('Error: No se encontró el ID del usuario');
      return;
    }

    const existingReaction = userReactions[postId];

    if (existingReaction === type) {
      setMessage('Ya reaccionaste con esta opción.');
      return;
    }

    if (existingReaction) {
      const { error: updateError } = await supabase
        .from('reactions')
        .update({ type })
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (updateError) {
        setMessage(`Error al actualizar reacción: ${updateError.message}`);
      } else {
        setMessage('Reacción actualizada');
        setReactions((prevReactions) => ({
          ...prevReactions,
          [postId]: {
            ...prevReactions[postId],
            [existingReaction]: (prevReactions[postId]?.[existingReaction] || 1) - 1,
            [type]: (prevReactions[postId]?.[type] || 0) + 1,
          },
        }));
        setUserReactions({ ...userReactions, [postId]: type });
      }
    } else {
      const { error: insertError } = await supabase
        .from('reactions')
        .insert([{ post_id: postId, user_id: userId, type }]);

      if (insertError) {
        setMessage(`Error al añadir reacción: ${insertError.message}`);
      } else {
        setMessage('Reacción añadida');
        setReactions((prevReactions) => ({
          ...prevReactions,
          [postId]: {
            ...prevReactions[postId],
            [type]: (prevReactions[postId]?.[type] || 0) + 1,
          },
        }));
        setUserReactions({ ...userReactions, [postId]: type });
      }
    }
  };

  return (
    <div className="community-container">
      <h2>Comunidad de Estilo</h2>
      {message && <p>{message}</p>}
      <form className="new-post-form" onSubmit={handleAddPost}>
        <label>
          Contenido:
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="post-textarea"
          />
        </label>
        <label className="file-upload">
          Archivo (imagen o video):
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <button type="submit" className="post-button">Publicar</button>
      </form>

      <h3>Publicaciones Recientes</h3>
      <ul className="posts-list">
        {posts.map((post) => (
          <li key={post.id} className="post-item">
            <p className="post-user">Usuario: {post.users.name}</p>
            <p>{post.content}</p>
            {post.image_url && (
              post.image_url.includes("video")
              ? <video src={post.image_url} width="200" controls />
              : <img src={post.image_url} alt="Publicación" width="200" />
            )}
            <p>Fecha: {new Date(post.created_at).toLocaleString()}</p>

            <div className="reactions-section">
              <button onClick={() => handleReaction(post.id, 'like')} disabled={userReactions[post.id] === 'like'}>
                👍 Like {reactions[post.id]?.like || 0}
              </button>
              <button onClick={() => handleReaction(post.id, 'love')} disabled={userReactions[post.id] === 'love'}>
                ❤️ Love {reactions[post.id]?.love || 0}
              </button>
            </div>

            <div className="comment-section">
              <input
                type="text"
                value={commentContent[post.id] || ''}
                onChange={(e) => setCommentContent({ ...commentContent, [post.id]: e.target.value })}
                placeholder="Escribe un comentario"
                className="comment-input"
              />
              <button onClick={() => handleAddComment(post.id)} className="comment-button">Comentar</button>
            </div>

            <ul className="comments-list">
              {post.comments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <p>{comment.content}</p>
                  <small>{new Date(comment.created_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Community;
