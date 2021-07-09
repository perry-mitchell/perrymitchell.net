---
layout: post
title: A load balanced website using PHP FPM, Nginx, MySQL and Varnish (Part 2)
excerpt: So in the previous post") I covered the setup of Nginx and php5-fpm for
  our webservers. By the end of that, you should have been able to browse to
  the...
slug: load-balanced-website-php-fpm-nginx-mysql-varnish-part-2
permalink: article/load-balanced-website-php-fpm-nginx-mysql-varnish-part-2/index.html
date: 2014-01-22
updatedDate: 2014-01-22
tags:
  - post
  - nginx
  - varnish
  - wordpress
---

So in the [previous post](http://perrymitchell.net/article/load_balanced_website_php_fpm_nginx_mysql_varnish_part_1/ "A load balanced website using PHP FPM, Nginx, MySQL and Varnish (Part 1)") I covered the setup of Nginx and php5-fpm for our webservers. By the end of that, you should have been able to browse to the server to view the typical Nginx welcome header "Welcome to nginx!". At this stage, it would also be good to see if your php installation worked correctly, by changing to the directory **/usr/share/nginx**. You should first take ownership of the **www** folder, as well as granting group-write permissions on it (all recursively of course):

```
sudo chown -R perry:perry www
sudo chmod -R g+w www
```

Obviously replace "perry" with the username that you are logged in with.

Jump in to the **www** directory and move the existing index.html file aside (or delete it). Create a new file, **index.php**, and put the following contents inside it:

```
<?php
	phpinfo();
?>
```

You should now browse to your server, which will hopefully present the php info page.

![php_info_heading](http://perrymitchell.net/wp-content/uploads/2014/01/php_info_heading.png)

You should also see evidence that memcache is setup correctly:

![Memcache in phpinfo](http://perrymitchell.net/wp-content/uploads/2014/01/php_tute_memcache_info.png)

If you see these things, everything went fine.

## Setting up MySQL

Now that we've got our PHP server(s), we should continue on to the database. We'll configure the MySQL server to allow remote access _only_ to our PHP servers. Let's start by installing MySQL:
`sudo apt-get install mysql-server mysql-client -y`

![mysql setup](http://perrymitchell.net/wp-content/uploads/2014/01/mysql_setup.png)

Once it's installed, we'll create a new user that we'll use for Wordpress. Login to your new installation:
`mysql -u root -p`

And create the new user account (using a name of your choice) with a database:

```
create database wordpress;
GRANT ALL PRIVILEGES ON wordpress.* To 'perry'@'%' IDENTIFIED BY 'some_password';
GRANT ALL PRIVILEGES ON wordpress.* To 'perry'@'localhost' IDENTIFIED BY 'some_password';
flush privileges;
exit;
```

The example above would create a database called 'wordpress', on which 'perry' has access (from any host, and all rights). The second "GRANT ALL" line specifies localhost as the originating host, as '%' does not include localhost by default (this is due to the fact that connecting from localhost may be through a Unix socket). **Remember** that this is not secure, and I would highly recommend not doing it this way in a production environment (or anything public-facing for that matter). We have not yet configured the access-control, but regardless, you should properly analyse your access requirements before deciding on user access and permissions.

**Note:** We will we revisiting the user's hosts for the database later in this article - but for now, we should leave it as '%'.

Let's run a couple of quick commands just to see that everything worked.. Your output should look similar to this:

```
perry@tute-mysql:~$ mysql -uperry -psome_password -e "show databases;"
+--------------------+
| Database           |
+--------------------+
| information_schema |
| test               |
| wordpress          |
+--------------------+
perry@tute-mysql:~$ mysql -uperry -psome_password -e "use wordpress; create table test (test_id INT NOT NULL, PRIMARY KEY (test_id) ); describe test; drop table test;"
+---------+---------+------+-----+---------+-------+
| Field   | Type    | Null | Key | Default | Extra |
+---------+---------+------+-----+---------+-------+
| test_id | int(11) | NO   | PRI | NULL    |       |
+---------+---------+------+-----+---------+-------+
```

Seeing this output will confirm that your setup is correct and ready to use, but there's one last thing we need to do before we continue. Currently, the MySQL server will only be configured to listen locally on 127.0.0.1\. We need to get it to listen on the public interfaces so our PHP servers can see it.

Edit the file "/etc/mysql/my.cnf" and locate the line with the property "**bind-address**". The segment should resemble this:

```
#
# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
bind-address            = 127.0.0.1
```

Change 127.0.0.1 to 0.0.0.0 (listen on all interfaces), and then save and quit the file. Restart the MySQL server by running "sudo service mysql restart".

## Setting up Wordpress

Now that we have a functioning PHP/Nginx and MySQL setup, we can begin to configure our web system. You can obviously use anything you like here, but I've chosen Wordpress due to its popularity and my familiarity with its inner workings. I also happen to know of a couple of plugins that are tailor-made for Nginx-based setups.

Let's jump back to our PHP server (or servers, if you're doing both at once - otherwise we'll duplicate this one later) and grab the latest copy of Wordpress (best to do this from the home directory - ""):

![Wordpress download CLI](http://perrymitchell.net/wp-content/uploads/2014/01/download_wordpress.png)

Unzip it by running "unzip latest.zip". You then want to remove any files within the web directory, and copy the contents of the newly created "wordpress" directory into the web directory. Your commands may look like this:

```
unzip latest.zip
cd /usr/share/nginx/www
rm -r *
cd -
cp -r wordpress/* /usr/share/nginx/www
cd -
ls
```

This set of commands should have copied the files from the extracted folder, and you should be looking at a list of them now. There should also be 3 directories, "wp-content", "wp-includes" and "wp-admin". We should now be ready to run the Wordpress setup, so browse to the IP address of the PHP server (you can use "ip a" to find the IP address).

![Wordpress Install Let](http://perrymitchell.net/wp-content/uploads/2014/01/wordress_install_letsgo.png

If you can see the Wordpress installation steps, everything went OK. If you cannot, and there is an error presented instead, you may have missed a step. It might be wise to reboot the server if there is an issue, as many configuration changes I've covered require their associated services to be restarted for the changes to take effect.

![Wordpress DB setup](http://perrymitchell.net/wp-content/uploads/2014/01/wordpress_install_db_setup.png)

The next screen (above) will be the database setup. You'll need to specify the usual details here, but remember to change localhost (in "Database Host") to the IP address or domain name of the MySQL server you setup earlier. Click "Submit" when you're finished to test the connection.

If you receive the following screen, you may not have write permissions for the web directory:

![Wordpress install no write](http://perrymitchell.net/wp-content/uploads/2014/01/wordpress_install_write_perms.png)

On the next page, you'll need to enter some final details in for Wordpress like your user account information. Once this is complete, you should see the following success message:

![wordpress_setup_success](http://perrymitchell.net/wp-content/uploads/2014/01/wordpress_setup_success.png)

And then you can login!

![Wordpress dashboard after installation](http://perrymitchell.net/wp-content/uploads/2014/01/wordpress_dashboard_post_install.png)

So we now have a working Wordpress installation, built on Nginx and PHP FPM, connecting to a remote MySQL database. For those of you that are already using 2 PHP servers, now would be a good time to copy the files over to the other server. **Do not **run the installation a second time, as the database has already been created. If you built with only the one server, which is recommended, you can now duplicate that server and ensure it too connects to the Wordpress database. At this stage, you should have 2 Wordpress sites working off the same database. When we install and activate Varnish, they'll appear as one through Varnish's reverse-proxy. Sessions and other important parts of the website will be handled automatically by Varnish, but we'll need to take care of some things like media uploads.

**Note:** It is important to remember here that Wordpress stores the address (domain) of the site in the database or config files. It will be tied to the first server you setup, so when you try to login from the second you'll be redirected to the first. When we setup Varnish, we'll be using a hostname - This will solve the problem of using an IP address for the Wordpress domain.

## MySQL Access Control

In the previous section, we setup a new user using the "GRANT" command. In this command, we specified '%' as the host, meaning that we're allowing this user to authenticate from _any_ host. Obviously this is a security concern, as we only want the database to be accessible from our PHP servers. We're going to change the hosts in the user table in the mysql database:

```
mysql> use mysql;

mysql> select host, user from user;
+------------+------------------+
| host       | user             |
+------------+------------------+
| %          | perry            |
| 127.0.0.1  | root             |
| ::1        | root             |
| localhost  |                  |
| localhost  | debian-sys-maint |
| localhost  | perry            |
| localhost  | root             |
| tute-mysql |                  |
| tute-mysql | root             |
+------------+------------------+
9 rows in set (0.00 sec)
```

So we can see the one we need to change - "perry" with a host value of "%" - This needs to become secure, by assigning it to an IP address and not a wildcard. Let's remove just that entry:

```
mysql> DELETE FROM user WHERE user='perry' AND host='%';
Query OK, 1 row affected (0.00 sec)

mysql> select host, user from user;
+------------+------------------+
| host       | user             |
+------------+------------------+
| 127.0.0.1  | root             |
| ::1        | root             |
| localhost  |                  |
| localhost  | debian-sys-maint |
| localhost  | perry            |
| localhost  | root             |
| tute-mysql |                  |
| tute-mysql | root             |
+------------+------------------+
8 rows in set (0.00 sec)
```

Now we're left with local login ability only for user "perry". Next we're going to re-add the user using a command we wrote previously, but we'll specify the IP address of the PHP host instead of the wildcard:

```
GRANT ALL PRIVILEGES ON wordpress.* To 'perry'@'192.168.0.35' IDENTIFIED BY 'some_password';
GRANT ALL PRIVILEGES ON wordpress.* To 'perry'@'192.168.0.43' IDENTIFIED BY 'some_password';
flush privileges;
```

Notice that I have 2 lines, 1 for each of my PHP servers. If we select from the table again:

```
mysql> select host, user from user;
+--------------+------------------+
| host         | user             |
+--------------+------------------+
| 127.0.0.1    | root             |
| 192.168.0.35 | perry            |
| 192.168.0.43 | perry            |
| ::1          | root             |
| localhost    |                  |
| localhost    | debian-sys-maint |
| localhost    | perry            |
| localhost    | root             |
| tute-mysql   |                  |
| tute-mysql   | root             |
+--------------+------------------+
10 rows in set (0.00 sec)
```

We can see that the user "perry" can login from 3 places: 192.168.0.35, 192.168.0.43 and localhost. You should now try loading your Wordpress blog again from the IP address to ensure the host updates worked.

## Coffee break

In the next article we'll setup the Varnish server and its backends - Turning our Wordpress installation into a load-balanced system.

When you're ready (the next article is quite lengthy), check out [part 3](http://perrymitchell.net/article/a-load-balanced-website-using-php-fpm-nginx-mysql-and-varnish-part-3/).
