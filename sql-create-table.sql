CREATE TABLE Channel(channel_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, account_id INT REFERENCES Account(account_id), channel_name VARCHAR(50), subscribers_count INT);

CREATE TABLE Video(video_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Length TIME, title VARCHAR(63), description VARCHAR(255), views INT, likes INT, Is_short_style BOOLEAN, channel_id INT, FOREIGN KEY (channel_id) REFERENCES Channel(channel_id));

CREATE TABLE Playlist(playlist_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, playlist_name VARCHAR(50), channel_id INT, FOREIGN KEY (channel_id) REFERENCES Channel(channel_id));

CREATE TABLE Account(account_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(63), created_on DATE);

CREATE TABLE VideoCategory(Category VARCHAR(100), video_id VARCHAR(100) REFERENCES Video(video_id), PRIMARY KEY (Category, video_id));

CREATE TABLE VideoPlaylist(playlist_id INT REFERENCES Playlist(playlist_id), video_id INT REFERENCES Video(video_id), PRIMARY KEY (playlist_id, video_id));


CREATE TABLE Comment(comment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Likes INT, Dislikes INT, words VARCHAR(100), channel_id INT REFERENCES Channel(channel_id), video_id INT REFERENCES Video(video_id));

CREATE TABLE Comment_on(commenter_id INT REFERENCES Comment(comment_id), commentee_id INT, PRIMARY KEY(commenter_id,commentee_id));

CREATE TABLE SubscribeTo(subscriber_id INT REFERENCES Channel(channel_id), subscribee_id INT REFERENCES Channel(channel_id), PRIMARY KEY(subscriber_id,subscribee_id));
